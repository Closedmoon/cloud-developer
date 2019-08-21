import * as AWS from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'

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

}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient()
}
