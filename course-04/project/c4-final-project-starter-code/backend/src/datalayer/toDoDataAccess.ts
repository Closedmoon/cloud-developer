import * as AWS from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoDataAccess {

    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly imagesBucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
        private readonly indexName = process.env.INDEX_NAME,
        private readonly s3 = new AWS.S3({
            signatureVersion: 'v4'
          }) ) { }

    async createToDo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todo
        }).promise()

        return todo
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async getUploadUrl(todoId: string) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.imagesBucketName,
            Key: todoId,
            Expires: this.urlExpiration
          })
    }

    async deleteTodo(todoId: string) {

        var params = {
            TableName: this.todoTable,
            Key: {
              todoId: todoId
            }
          }
          console.log("Deleting item with key", todoId)
          await this.docClient.delete(params, function (err, data) {
          if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              console.log("Delete succeeded:", JSON.stringify(data, null, 2));
          }
          }).promise()

    }

    async updateTodo(todoId: string, todoUpdate: TodoUpdate) {

        var params = {
            TableName: this.todoTable,
            Key: {
              todoId: todoId
            },
            UpdateExpression: "SET #n1 = :n, #d1 = :d, #do1 = :e",
            ExpressionAttributeValues: {
                ':n': todoUpdate.name,
                ':d': todoUpdate.dueDate,
                ':e': todoUpdate.done
            },
            ExpressionAttributeNames: {
              "#n1": "name",
              "#d1": "dueDate",
              "#do1": "done"
            }
            
          }
          
          await this.docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error :", JSON.stringify(err, null, 2));
            } else {
                console.log("Update succeeded:", JSON.stringify(data, null, 2));
            }
          }).promise()

    }

}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient()
}
