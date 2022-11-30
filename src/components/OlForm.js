import React from 'react'
import { HiMenu, HiChevronUp, HiChevronDown, HiOutlineX } from "react-icons/hi"

const OlForm = (props) => {
    return(
        <>
            <div className='grab-icon'><HiMenu /></div>
            <div className='content-input-form'>
                <h4>Numbered List</h4>
                <label>Title</label>
                <input 
                    type='text'
                    placeholder='List Title'
                    value={props.component.title}
                    onChange={props.handleComponentTitleChange(props.index)}
                />

                <ol>
                    {props.component.list_items.map((list_item, listItemIndex) => (
                        <li key={listItemIndex}>
                            <button className='content-input-list-control-up' type='button' onClick={props.handleListItemReorder(props.index, listItemIndex, -1)}><HiChevronUp /></button>
                            <button className='content-input-list-control-down' type='button' onClick={props.handleListItemReorder(props.index, listItemIndex, 1)}><HiChevronDown /></button>
                            <input
                                type='text'
                                placeholder='Item'
                                value={list_item}
                                onChange={props.handleListItemChange(props.index, listItemIndex)}
                            />

                            <button className='content-input-list-control-delete' type='button' onClick={props.removeListItem(props.index, listItemIndex)}><HiOutlineX /></button>
                        </li>
                    ))}
                    <button className='content-input-list-add' type='button' onClick={props.addListItem(props.index)}>Add List Item</button>
                </ol>
                

                <button className='content-input-form-delete' type='button' onClick={props.removeComponent(props.index)}>Remove Numbered List</button>           
            </div>
        </>
    )
}

export default OlForm