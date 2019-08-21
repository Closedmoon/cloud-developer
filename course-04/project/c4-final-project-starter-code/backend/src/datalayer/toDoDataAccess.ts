import * as AWS from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoDataAccess {

    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly imagesBucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
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
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
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
        this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                "todoId":todoId
            }

        })
    }

    async updateTodo(todoId: string, todoUpdate: TodoUpdate) {
        this.docClient.update({
            TableName: this.todoTable,
            Key: {
                'todoId' : todoId
            },
            UpdateExpression: 'set name = :n, duedate = :d, done = :e',
            ExpressionAttributeValues: {
                ':n': todoUpdate.name,
                ':d': todoUpdate.dueDate,
                ':e': todoUpdate.done
            }
        })

    }

}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient()
}
