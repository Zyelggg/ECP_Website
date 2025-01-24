import pymysql
import boto3
import json

def lambda_handler(event, context):
    rds = boto3.client('rds')
    rds_obj = rds.describe_db_instances(DBInstanceIdentifier="ecp-rds")

    endpoint = rds_obj['DBInstances'][0]["Endpoint"]["Address"] # get using boto3
    username = "admin" 
    password = "password" 
    database_name = "ecp_dev" 

    connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
    cursor = connection.cursor()
    id_str = event.get("id")
    if (cursor): 
        if id_str is not None | "":
            query = f"DELETE FROM Products WHERE ID={id_str}" 
            cursor.execute(query)
        rows = "No id_str found"
    else: 
        rows = "Error with connection.cursor()"
    cursor.close()
    connection.close()

    return {
        'statusCode': 200,
        'body': json.dumps(f"{rows}")
    }