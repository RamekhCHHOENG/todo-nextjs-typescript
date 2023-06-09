import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { http } from '@/app'
import { GetServerSideProps } from 'next'
import { useState, useCallback } from 'react'
import { debounce, isEmpty } from 'lodash'

interface Todo {
  _id: string
  todo: string
  isCompleted: boolean
  createdAt: string
}

interface Props {
  todos: Todo[]
}

export default function Home({ todos: initialTodos }: Props) {
  const [todo, setTodo] = useState<Todo>({
    todo: '',
    isCompleted: false,
    _id: '',
    createdAt: ''
  })
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [todoId, setTodoId] = useState<String>('')
  const [busy, setBusy] = useState(false)
  const [isToggleComplete, setIsToggleComplete] = useState(false)
  const [isSearching, setSearching] = useState(false)
  const [isDeleting, setDeleting] = useState(false)
  const [q, setQ] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTodo({
        ...todo,
        todo: e.target.value
      })
    },
    [setTodo, todo]
  )

  const handleSearch = useCallback(
    debounce( async (query) => {
      setSearching(true)
      try {
        const { data } = await http.get('/todos', { params: { q: query } })
        setTodos(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setSearching(false)
      }
    }, 500),
    [http, setTodos]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value
      setQ(query)
      handleSearch(query)
    },
    [handleSearch, setQ]
  )

  const getTodos = async () => {
    const { data } = await http.get('/todos', {
      params: { q: q || undefined }
    })
    setTodos(data.data)
  }

  const addTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isEmpty(todo.todo)) return
    setBusy(true)
    try {
      if (todo._id) {
        await http.put(`/todo/${todo._id}`, todo)
      } else {
        await http.post('/todo', todo)
      }
      setTodo({
        _id: '',
        todo: '',
        isCompleted: false,
        createdAt: ''
      })
      await getTodos()
    } catch (error) {
      console.error(error)
    } finally {
      setBusy(false)
    }
  }

  const updateTodo = async (id: string) => {
    const todoToUpdate = todos.find((todo) => todo._id === id)
    setTodoId(id)
    setIsToggleComplete(true)
    if (todoToUpdate) {
      try {
        await http.put(`/todo/${id}`, {
          ...todoToUpdate,
          isCompleted: !todoToUpdate.isCompleted
        })
        await getTodos()
      } catch (error) {
        console.error(error)
      } finally {
        setIsToggleComplete(false)
        setTodoId('')
      }
    }
  }

  const deleteTodo = async (id: string) => {
    setTodoId(id)
    setDeleting(true)
    try {
      await http.delete(`/todo/${id}`)
      await getTodos()
    } catch (error) {
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  const editTodo = (id: string) => {
    const todoToEdit = todos.find((todo) => todo._id === id)
    if (todoToEdit) {
      setTodo({
        ...todoToEdit
      })
    }
  }
  return (
    <>
      <Head>
        <title>Todo-Application</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.heading}>Todo-Application</h1>
        <div className={styles.container}>
          <form className={styles.form_container}>
            <input
              className={styles.input}
              type='text'
              placeholder='&#x1F50D; Search todo...'
              onChange={handleInputChange}
              value={q}
            />
          </form>
          <form onSubmit={addTodo} className={styles.form_container}>
            <input
              className={styles.input}
              type='text'
              placeholder='Task to be done...'
              disabled={busy || !isEmpty(q)}
              onChange={(e) => handleChange(e)}
              value={todo.todo}
              name="todo"
              required
            />
            <button
              className={styles.submit_btn}
              disabled={busy || isEmpty(todo.todo) || !isEmpty(q)}
              type='submit'
            >
              {busy ? 'Loading...' : todo._id ? 'Update' : 'Add'}
            </button>
          </form>
          {todos.map((value) => (
            <div
              key={value._id}
              className={styles.todo_container}
              style={{ height: value.todo.length >= 55 ? 'auto' : '40px' }}
            >
              <div className={styles.complete_container}>
                {isToggleComplete && todoId === value._id ? (
                  <div className={styles.loader} />
                ) : (
                  <input
                    type='checkbox'
                    className={styles.check_box}
                    checked={value.isCompleted}
                    onChange={() => updateTodo(value._id)}
                  />
                )}
              </div>
              <p
                className={
                  value.isCompleted
                    ? styles.todo_text + ' ' + styles.line_through
                    : styles.todo_text
                }
              >
                {value.todo}
              </p>
              <button
                onClick={() => editTodo(value._id)}
                className={styles.edit_todo}
              >
                &#9998;
              </button>
      

              <div className={styles.complete_container}>
                {isDeleting && todoId === value._id ? (
                  <div className={styles.loader} />
                ) : (
                  <button
                  disabled={!!todo._id}
                  onClick={() => deleteTodo(value._id)}
                  className={styles.remove_todo}
                >
                  &#10006;
                </button>
                )}
              </div>
            </div>
          ))}
          {todos.length === 0 && <h2 className={styles.no_todos}> {q? 'No Result':'No todos'}</h2>}
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { data } = await http.get('/todos')

  return {
    props: {
      todos: data.data
    }
  }
}
