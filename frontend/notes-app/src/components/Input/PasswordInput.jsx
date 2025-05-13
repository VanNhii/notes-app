import React, { useState } from 'react'
import {FaRegEye, FaRegEyeSlash} from "react-icons/fa6"

const PasswordInput = ({ value, onChange, placeholder}) => {
const [isShowPasword, setIsShowPassword] = useState(false);

const toggleShowPassWord = () => {
    setIsShowPassword(!isShowPasword);

};


  return (
    <div className='flex items-center bg-transparent border-[1.5px] px-5 rounded mb-3 '>
        <input
        type={isShowPasword? "text" : "password" } 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder || "Password"}
        className='w-full text-sm bg-transparent py-3 mr-4 rounded outline-none'
         />

    { isShowPasword ? (<FaRegEye 
        size={22}
        className="text-primary cursor-pointer"
        onClick= {() => toggleShowPassWord()}
    />
    ): (<FaRegEyeSlash
            size={22}
            className='text-slate-400 cursor-pointer'
            onClick= {() => toggleShowPassWord()}

        />)
    }
    </div>
  )
}

export default PasswordInput