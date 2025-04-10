import json
import boto3
from boto3.dynamodb.conditions import Key

# AWS Clients
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('TranslationHistory')

def get_cors_headers():
    """Return CORS headers for responses."""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json'
    }

def get_user_id_from_jwt(event):
    """Extract user ID from requestContext claims."""
    try:
        # For testing, allow direct user_id in query parameters
        if 'queryStringParameters' in event and event['queryStringParameters'] and 'user_id' in event['queryStringParameters']:
            return event['queryStringParameters']['user_id']
            
        claims = event['requestContext']['authorizer']['jwt']['claims']
        user_id = claims.get('sub')
        print("User ID from claims:", user_id)
        return user_id
    except (KeyError, json.JSONDecodeError):
        print("Claims not found in event - unauthorized")
        return None

def lambda_handler(event, context):
    """Handle translation history request."""
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
        # Query DynamoDB for user's translation history
        response = table.query(
            KeyConditionExpression=Key('user_id').eq(user_id),
            ScanIndexForward=False,  # Sort by timestamp in descending order
            Limit=50  # Limit to last 50 translations
        )
        
        # Format the response
        translations = []
        for item in response.get('Items', []):
            translations.append({
                'originalText': item['original_text'],
                'translatedText': item['translated_text'],
                'fromLanguage': item['source_lang'],
                'toLanguage': item['target_lang'],
                'timestamp': int(item['timestamp'])
            })

        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'translations': translations
            })
        }

    except Exception as e:
        print("Error fetching history:", str(e))
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'error': 'Failed to fetch translation history',
                'details': str(e)
            })
        } 