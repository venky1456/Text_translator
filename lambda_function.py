import json
import boto3
import time
import re

# AWS Clients
translate_client = boto3.client('translate', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('TranslationHistory')

# Supported languages
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'hi': 'Hindi',
    'ar': 'Arabic',
    'te': 'Telugu'
}

def get_cors_headers():
    """Return CORS headers for responses."""
    return {
        'Access-Control-Allow-Origin': '*',  # Allow all origins for testing
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json'
    }

def validate_language_code(lang_code):
    """Validate if the language code is supported."""
    if lang_code == 'auto':
        return True
    return lang_code in SUPPORTED_LANGUAGES

def validate_text(text):
    """Validate the input text."""
    if not text or not isinstance(text, str):
        return False
    # Remove whitespace and check if text is empty
    if not text.strip():
        return False
    # Check if text is too long (AWS Translate limit is 5000 bytes)
    if len(text.encode('utf-8')) > 5000:
        return False
    return True

def get_user_id_from_jwt(event):
    """Extract user ID from requestContext claims."""
    try:
        # For testing, allow direct user_id in body
        if 'user_id' in event.get('body', {}):
            return json.loads(event['body'])['user_id']
            
        claims = event['requestContext']['authorizer']['jwt']['claims']
        user_id = claims.get('sub')
        print("User ID from claims:", user_id)
        return user_id
    except (KeyError, json.JSONDecodeError):
        print("Claims not found in event - unauthorized")
        return None

def create_response(status_code, body, headers=None):
    """Create a standardized response with CORS headers."""
    response_headers = get_cors_headers()
    if headers:
        response_headers.update(headers)
    
    return {
        'statusCode': status_code,
        'headers': response_headers,
        'body': json.dumps(body)
    }

def lambda_handler(event, context):
    """Handle translation request and store history in DynamoDB."""
    print("Received Event:", json.dumps(event))

    # Handle OPTIONS request for CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': ''
        }

    # Parse JSON body
    try:
        body = json.loads(event.get('body', '{}'))
        print("Parsed body:", body)
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }

    # Get user_id (for testing, can be passed in body)
    user_id = get_user_id_from_jwt(event)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Unauthorized'})
        }

    text = body.get('text')
    source_lang = body.get('source_lang', 'auto')
    target_lang = body.get('target_lang', 'en')

    # Validations
    if not text:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Missing "text" field'})
        }

    if source_lang == target_lang and source_lang != 'auto':
        return {
            'statusCode': 400,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Source and target languages cannot be the same'})
        }

    # Translate text
    try:
        translate_response = translate_client.translate_text(
            Text=text,
            SourceLanguageCode=source_lang if source_lang != 'auto' else None,
            TargetLanguageCode=target_lang
        )
        translated_text = translate_response['TranslatedText']
        detected_language = translate_response.get('SourceLanguageCode', source_lang)
    except Exception as e:
        print("Translation error:", str(e))
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Translation failed', 'details': str(e)})
        }

    # Save translation history to DynamoDB
    timestamp = str(int(time.time()))
    item = {
        'user_id': user_id,
        'timestamp': timestamp,
        'original_text': text,
        'translated_text': translated_text,
        'source_lang': detected_language,
        'target_lang': target_lang
    }

    try:
        table.put_item(Item=item)
    except Exception as e:
        print("DynamoDB Error:", str(e))
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Failed to save to database', 'details': str(e)})
        }

    # Return success response
    return {
        'statusCode': 200,
        'headers': get_cors_headers(),
        'body': json.dumps({
            'translated_text': translated_text,
            'source_lang': detected_language,
            'target_lang': target_lang,
            'user_id': user_id,
            'timestamp': timestamp
        })
    } 