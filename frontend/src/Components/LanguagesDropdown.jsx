import React from 'react'
import Select from 'react-select'
import { customStyles } from '../Constants/customStyles'
import {languageOptions} from '../Constants/languageOptions'

const LanguagesDropdown = ({ onSelectChange }) => {
    return (
        <div className='main max-w-xs'>
            <Select
                placeholder={`Filter By Category`}
                options={languageOptions}
                styles={customStyles}
                defaultValue={languageOptions[0]}
                onChange={(selectedoption) => onSelectChange(selectedoption)}
            />
        </div>
    )
}

export default LanguagesDropdown
