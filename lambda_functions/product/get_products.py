import pymysql
import json
import boto3
from datetime import datetime

def custom_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    

def lambda_handler(event, context):
    rds = boto3.client('rds')
    rds_obj = rds.describe_db_instances(DBInstanceIdentifier="ecp-rds")
    
    endpoint = rds_obj['DBInstances'][0]["Endpoint"]["Address"] # get using boto3
    username = "admin"
    password = "password" 
    database_name = "ecp_dev" 
    
    connection = pymysql.connect(host=endpoint, user=username, password=password, db=database_name)
    cursor = connection.cursor(pymysql.cursors.DictCursor)

    query = "SELECT * FROM products" 
    cursor.execute(query)
    rows = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return {
        'statusCode': 200,
        'body': json.dumps(rows, default=custom_serializer)
    }
