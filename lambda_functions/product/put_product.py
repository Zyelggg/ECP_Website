import pymysql
import boto3
import json
import os

def lambda_handler(event, context):

    endpoint = os.environ['DB_HOST']
    username = "admin" 
    password = "password" 
    database_name = "ecp_dev" 

    path_parameters = event.get("pathParameters")
    product_id = path_parameters.get("id") if path_parameters else None

    try: 
        connection = pymysql.connect(host=endpoint, user=username, password=password, db=database_name)
    except Exception as e: 
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"Database connection failed: {str(e)}"})
        }
    
    try:
        connection.ping(reconnect=False)
        cursor = connection.cursor()
        
        query = "UPDATE products SET prod_name=%s prod_price=%s description=%s WHERE ID=%s" 
        cursor.execute(query, (event['prod_name'], event['prod_price'],event['description'], product_id))
        connection.commit()

        result  = "Updated Successfully"
        
        connection.close()
        return {
            'statusCode': 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins
                "Access-Control-Allow-Methods": "GET,PUT,DELETE, OPTIONS",  # Allowed HTTP methods
                "Access-Control-Allow-Headers": "Content-Type, Authorization"  # Allowed headers
            },
            'body': json.dumps(f"{result}")
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"Failed to fetch data: {str(e)}"})
        }