import json
import boto3
from datetime import datetime

# AWS Clients
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('TranslationHistory')

def get_cors_headers():
    """Return CORS headers for responses."""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json'
    }

def get_user_id_from_jwt(event):
    """Extract user ID from requestContext claims."""
    try:
        claims = event['requestContext']['authorizer']['jwt']['claims']
        user_id = claims.get('sub')
        print("User ID from claims:", user_id)
        return user_id
    except (KeyError, json.JSONDecodeError):
        print("Claims not found in event - unauthorized")
        return None

def lambda_handler(event, context):
    """Handle saving translation request."""
    print("Received Event:", json.dumps(event))

    # Handle OPTIONS request for CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': ''
        }

    # Get user_id
    user_id = get_user_id_from_jwt(event)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Unauthorized'})
        }

    try:
        # Parse request body
        body = json.loads(event['body'])
        
        # Validate required fields
        required_fields = ['original_text', 'translated_text', 'source_lang', 'target_lang', 'timestamp']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({'error': f'Missing required field: {field}'})
                }

        # Save translation to DynamoDB
        item = {
            'user_id': user_id,
            'timestamp': body['timestamp'],
            'original_text': body['original_text'],
            'translated_text': body['translated_text'],
            'source_lang': body['source_lang'],
            'target_lang': body['target_lang']
        }
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'message': 'Translation saved successfully',
                'translation': item
            })
        }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        print("Error saving translation:", str(e))
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'error': 'Failed to save translation',
                'details': str(e)
            })
        } 