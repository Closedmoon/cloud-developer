import * as AWS from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'

export class TodoDataAccess {

    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODO_TABLE
    ) {

    }

    async createToDo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todo
        }).promise()

        return todo
    }

}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient()
}
