import * as uuid from 'uuid'

import {TodoItem} from '../models/TodoItem'

import {TodoDataAccess} from '../datalayer/toDoDataAccess'
import {CreateTodoRequest} from '../requests/CreateTodoRequest'
import {UpdateTodoRequest} from '../requests/UpdateTodoRequest'

const bucketName = process.env.IMAGES_S3_BUCKET

const todoAccess = new TodoDataAccess()

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    loginUserId: string): Promise<TodoItem> {

        const itemId = uuid.v4();

        return await todoAccess.createToDo({
            userId: loginUserId,
            todoId: itemId,
            name: createTodoRequest.name,
            dueDate: createTodoRequest.dueDate,
            done: false,
            createdAt: new Date().toISOString(),
            attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
        })
     
    }

export async function getTodos(userId: string):Promise<TodoItem[]> {

    return await todoAccess.getTodos(userId)
}

export async function IsValidTodoId(todoId: string): Promise<boolean> {
    return await todoAccess.IsValidTodoId(todoId)

}

export async function getUploadUrl(todoId: string) {
    return await todoAccess.getUploadUrl(todoId)
}

export async function deleteTodo(todoId: string) {
    return await todoAccess.deleteTodo(todoId)
}

export async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest) {
    return await todoAccess.updateTodo(todoId, {
        name: updateTodo.name,
        dueDate: updatedTodo.dueDate,
        done: updatedTodo.done
    })
}