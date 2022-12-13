import React, { useState, useEffect } from 'react'
import '../scss/create-edit-folder.scss'
import { useSelector } from 'react-redux'
import { useParams, Navigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import apiClient from '../http-common'
import Recipes from './Recipes'

const EditFolder = () => {
    const [result, setResult] = useState({data: {}, status: null, message: null})
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [checkedRecipes, setCheckedRecipes] = useState([])
    const currentUser = useSelector((state) => state.user)
    const { id } = useParams()

    let dataPackage = {}

    const { isLoading: isLoadingFolder, refetch: getFolderById } = useQuery(
        'query-folder-by-id',
        async () => {
            return await apiClient.get(`/folders/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token.token}`}})
        },
        {
            enabled: false,
            retry: 1,
            onSuccess: (res) => {
                const apiResp = {
                    status: res.status + '-' + res.statusText,
                    headers: res.headers,
                    data: res.data.data,
                    meta: res.data.meta
                }
                setResult({data: apiResp.data, status: apiResp.status, message: null})
                setTitle(apiResp.data.title)
                setDescription(apiResp.data.description)
                setCheckedRecipes(apiResp.data.recipes)
            },
            onError: (err) => {
                console.error(err.response?.data || err)
                setResult({data: {}, status: 'Error', message: err.response?.data || err})
            }
        }
    )

    const { isLoading: isPostingFolder, mutate: postFolder } = useMutation(
        async () => {
            return await apiClient.put(`/folders/${ id }`, {folder: dataPackage}, {headers: {'Authorization': `Bearer ${currentUser.token.token}`}})
        },
        {
            onSuccess: (res) => {
                const apiResp = {
                    status: res.status + '-' + res.statusText,
                    headers: res.headers,
                    data: res.data.data,
                    meta: res.data.meta
                }
                setResult({data: apiResp.data, status: apiResp.status, message: null, submitted: true, deleted: false})
            },
            onError: (err) => {
                console.error(err.response?.data || err)
                setResult({data: {}, status: 'Error', message: err.response?.data || err, submitted: false, deleted: false})
            }
        }
    )

    const { isLoading: isDeletingFolder, mutate: deleteFolder } = useMutation(
        async () => {
            return await apiClient.delete(`/folders/${ id }`, { headers: {'Authorization': `Bearer ${currentUser.token.token}`}})
        },
        {
            onSuccess: (res) => {
                const apiResp = {
                    status: res.status + '-' + res.statusText,
                    headers: res.headers,
                    data: res.data.data,
                    meta: res.data.meta
                }
                setResult({data: apiResp.data, status: apiResp.status, message: null, submitted: false, deleted: true})
            },
            onError: (err) => {
                console.error(err.response?.data || err)
                setResult({data: {}, status: 'Error', message: err.response?.data || err, submitted: false, deleted: false})
            }
        }
    )

    useEffect(() => {
        function ferretFolderById() {
            if (id) {
                try {
                    getFolderById()
                } catch (err) {
                    console.error(err)
                    setResult({status: 'Error', message: err})
                }
            }
        }

        ferretFolderById()
    }, [getFolderById, setResult, id])

    const handleTitleChange = (e) => setTitle(e.target.value)

    const handleDescriptionChange = (e) => setDescription(e.target.value)

    const handleAddRecipe = (recipe) => () => {
        if (!checkedRecipes.includes(recipe)) {
            setCheckedRecipes([...checkedRecipes, recipe])
        }
    }
    
    const handleRemoveRecipe = (targetRecipe) => () => setCheckedRecipes(checkedRecipes.filter((recipe) => recipe.id !== targetRecipe.id))

    const submitFolder = (e) => {
        e.preventDefault()
        let recipeIds = checkedRecipes.map((recipe) => {return recipe.id})

        dataPackage = {
            user_id: currentUser.id,
            title: title,
            description: description,
            recipe_ids: recipeIds
        }

        try {
            postFolder()
        } catch (err) {
            console.error(err)
            setResult({data: {}, status: 'Error', message: err, submitted: false})
        }
    }

    const renderErrors = () => {
        if (result.status === 'Error') {
            return <span>{result.status + ': ' + result.message}</span>
        }
    }

    if (isLoadingFolder || isPostingFolder || isDeletingFolder) {
        return <span>Loading...</span>
    } else if (result.submitted) {
        return <Navigate to={`/folder/${result.data.id}`} replace/>
    } else if (result.deleted){
        return <Navigate to={'/'} replace/>
    } else {
        return(
            <div className='create-folder-form'>
                <h2>Create Folder Form</h2>
                {renderErrors()}
                <form onSubmit={submitFolder}>
                    <label>Title</label>
                    <input required type='text' name='title' value={title} onChange={handleTitleChange} />

                    <label>Description</label>
                    <input type='text' name='description' value={description} onChange={handleDescriptionChange}/>

                    {checkedRecipes.map((recipe, recipeIndex) => (
                        <div key={recipeIndex}>
                            <h4>{recipe.title}</h4>
                            <button type='button' onClick={handleRemoveRecipe(recipe)}>Remove Recipe</button>
                        </div>
                    ))}

                    <Recipes formList={true} currentUser={currentUser} handleAddRecipe={handleAddRecipe} handleRemoveRecipe={handleRemoveRecipe} checkedRecipes={checkedRecipes.map(recipe => recipe.id)}/>

                    <button type='button' onClick={deleteFolder}>Delete Folder</button>

                    <input type='submit' value='Submit Folder' />
                </form>
            </div>
        )        
    }
}

export default EditFolder