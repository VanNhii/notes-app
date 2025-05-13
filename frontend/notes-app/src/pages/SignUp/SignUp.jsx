import React from 'react'
import Navbar from '../../components/Navbar/Navbar';
import PasswordInput from '../../components/Input/PasswordInput';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';

const SignUp = ()  => { 

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate()

  const handleSignUp = async (e) => { 
  e.preventDefault(); 

    if (!name) {
      setError("Vui lòng nhập tên của bạn !!!");
      return;
    }

    if (!validateEmail(email)) {
      setError("Vui lòng nhập email đúng định dạng !!!");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu (password) !!!");
      return;
    }

    setError("")

       //Gọi API trang SignUp

    try {
      const response = await axiosInstance.post("/create-account", {
        fullName: name,
        email: email,
        password: password,
      });

    // Xử lý đăng ký thành công và phản hồi về 
    if(response.data && response.data.error) {
        setError(response.data.message)

        return
    }
    if(response.data && response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken)
      navigate ('/dashboard')
    }
    } catch (error){
      // Xử lý lỗi đăng ký
      if(error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Có lỗi xảy ra vui lòng thử lại!");
      }
    }
}; 


return ( 
  <>
    <Navbar /> 

    <div className="flex items-center justify-center mt-28"> 
      <div className="w-96 border rounded bg-white px-7 py-10"> 
        <form onSubmit= {handleSignUp}> 
          <h4 className="text-2xl mb-7">Đăng ký</h4> 

            <input type="text" placeholder="Tên của bạn" className="input-box"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />

            <input type="text" placeholder="Email" className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput value={password}
            onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

            <button type='submit' className='btn-primary'>
              Đăng ký
            </button>
            <p className='text-sm text-center mt-4'>
              Bạn đã có tài khoản ? {" "}
              <Link to ="/login" className="font-medium text-primary underline">
                Đăng nhập tại đây
              </Link>
            </p>
        </form> 
       </div> 
    </div> 
  </>
  );
};

export default SignUp