import * as uuid from 'uuid'

import {TodoItem} from '../models/TodoItem'
import {TodoDataAccess} from '../datalayer/toDoDataAccess'
import {CreateTodoRequest} from '../requests/CreateTodoRequest'

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
            attachmentUrl: ''
        })
     
    }