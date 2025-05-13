import React, { useState } from 'react'
import TagInPut from '../../components/Input/TagInPut'
import { MdClose } from 'react-icons/md'
import axiosInstance from '../../utils/axiosInstance';

const AddEditNotes = ({noteData, type, getAllNotes, onClose, showToastMessage}) => {
    const [title, setTitle] = useState(noteData?.title || "");
    const [content, setContent] = useState(noteData?.content ||"");
    const [tags, setTags] = useState(noteData?.tags || []);

    const [error, setError] = useState(null);
    
    //Add notes thêm notes
    const addNewNote = async () => {
    
    try {
     const response = await axiosInstance.post("/add-note" ,
        {
            title,
            content,
            tags,
        } 
     );
     if(response.data && response.data.note) {
        showToastMessage("Thêm ghi chú thành công")
        getAllNotes()
        onClose()
        }

    } catch (error) {
              // Xử lý lỗi đăng nhập
      if(error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }
    }
    }

    //Edit notes chỉnh sửa notes
    const editNote = async () => {
    const noteId = noteData._id
    try {
     const response = await axiosInstance.put("/edit-note/"+ noteId,
        {
            title,
            content,
            tags,
        } 
     );
     if(response.data && response.data.note) {
        showToastMessage(" Chỉnh sửa ghi chú thành công")
        getAllNotes()
        onClose()
        }

    } catch (error) {
              // Xử lý lỗi đăng nhập
      if(error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }
    }
    }


    const handleAddNote = () => {
        if(!title) {
            setError("Vui lòng nhập vào tiêu đề");
            return;
        }

        if(!content) {
            setError("Vui lòng nhập vào nội dung");
            return;
        }
        if(type ==='edit') {
            editNote()
        } else {
            addNewNote()
        }
        setError("");
    };
  return (
    <div className='relative'>
        <button className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-red-50'
        onClick={onClose}>
        <MdClose className='text-xl text-slate-400'/>
        </button>
        <div className='flex flex-col gap-2'>
            <label className='input-label'>TIÊU ĐỀ</label>
            <input
            type='text'
            className='text-2xl text-slate-950 outline-none'
            placeholder='Đến phòng gym 5pm'
            value={title}
            onChange={({target}) => setTitle(target.value)} 
            />
        </div>

        <div className='flex flex-col gap-2 mt-4'>
            <label className='input-label'>NỘI DUNG</label>
            <textarea 
            type ="text"
            className='text-sm text-slate-950 outline-none bg-slate-100 p-2 rounded '
            placeholder='Nội dung'
            rows={10}
            value={content}
            onChange={({target}) => setContent(target.value)} />
        </div>

        <div className='mt-3'>
            <label className='input-label'>TAGS</label>
            <TagInPut tags={tags} setTags={setTags}/>
        </div>

        {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}

        <button 
        className='btn-primary font-medium mt-5 p-3'
        onClick={handleAddNote}> 
        {type === 'edit' ? 'UPDATE' : 'ADD'}
        </button>
    </div>
  )
}

export default AddEditNotes