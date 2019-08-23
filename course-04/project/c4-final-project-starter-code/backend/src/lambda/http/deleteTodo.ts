import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { deleteTodo, IsValidTodoId } from '../../businesslogic/todoLogic'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    if(!IsValidTodoId(todoId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid Todo Id'
        })
        
      }
    }

    // TODO: Remove a TODO item by id
    await deleteTodo(todoId)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
  }
}
