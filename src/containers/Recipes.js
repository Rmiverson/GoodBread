import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useQuery } from 'react-query'
import RecipeCards from '../components/RecipeCards'
import apiClient from '../http-common'

const Recipes = (props) => {
    const currentUser = props.currentUser

    const [currentItems, setCurrentItems] = useState([])
    const [pageCount, setPageCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)

    const { isLoading: isLoadingRecipes, refetch: getAllRecipes } = useQuery(
        'query-all-user-recipes',
        async () => {
            return await apiClient.get(`/recipes/?page=${currentPage + 1}&user_id=${currentUser.id}`, {headers: {'Authorization': `Bearer ${currentUser.token.token}`}})
        },
        {
            enabled: false,
            retry: 1,
            onSuccess: (res) => {
                const result = {
                    status: res.status + '-' + res.statusText,
                    headers: res.headers,
                    data: res.data.data,
                    meta: res.data.meta
                }
                setCurrentItems(result.data)
                setPageCount(result.meta.total_pages)
            }
        }
    )

    useEffect(() => {
        function ferretRecipes() {
            try {
                getAllRecipes()
            } catch (err) {
                console.error(err)
            }
        }

        ferretRecipes()
    }, [getAllRecipes, currentPage])

    const handlePageClick = (e) => {
        setCurrentPage(e.selected)
    }

    if (isLoadingRecipes) {
        return <span>Loading...</span>
    } else {
        return (
            <div className='all-recipes'>
                <h2>All Recipes</h2>
                <div className='all-recipes-list'>
                    <RecipeCards items={currentItems} formList={props.formList} />
                    <ReactPaginate 
                        breakLabel='...'
                        nextLabel='next >'
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={5}
                        pageCount={pageCount}
                        previousLabel='< previous'
                        renderOnZeroPageCount={null}
                    />
                </div>
            </div>
        )        
    }
}

export default Recipes