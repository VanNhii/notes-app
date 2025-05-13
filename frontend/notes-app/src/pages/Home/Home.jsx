import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import NoteCard from '../../components/Cards/NoteCard'
import { MdAdd } from 'react-icons/md';
import AddEditNotes from './AddEditNotes';
import Modal from 'react-modal'; 
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import moment from "moment"; 
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import AddNotesImg from '../../assets/images/add-notes.svg';
import NoDataImg from '../../assets/images/no-notes.svg';

const Home = () => {

const [openAddEditModal, setopenAddEditModal] = useState({
  isShown: false,
  type: "add",
  data: null,
});

const [showToastMsg, setshowToastMsg] = useState({
  isShown: false,
  message: "",
  type: "add",
});

const [allNotes, setAllNotes] = useState([])
const [userInfo, setUserInfo] = useState(null);

const [isSearchNotes, setIsSearchNotes] = useState(false);


const navigate = useNavigate();

const handleEdit = (noteDetails) => {
  setopenAddEditModal({ isShown: true, data: noteDetails, type: "edit"});
};

const showToastMessage = (message, type) => {
  setshowToastMsg({
    isShown: true,
    message: message,
    type
  });
};

const handleCloseToast = () => {
  setshowToastMsg({
    isShown: false,
    message: "",
  });
};

// Get USER INFO
const getUserInfo = async () => {
   try {
      const response = await axiosInstance.get("/get-user");
      if(response.data && response.data.user) {
        setUserInfo(response.data.user);
        }
      }  catch (error){
      // Xử lý lỗi đăng nhập
      if(error.response.status === 401) {
        setError(error.response.data.message);
        localStorage.clear();
        navigate("/login")
      } 
    }
};

//GET ALL NOTES
const getAllNotes = async () => {
   try {
      const response = await axiosInstance.get("/get-all-notes");
      if(response.data && response.data.notes) {
        setAllNotes(response.data.notes);
        }
      }  catch (error){
      // Xử lý lỗi đăng nhập
        console.log("Không thể lấy được ghi chú vui lòng thử lại !");
        
    }
};

//Delete NOTES
const deleteNote = async (data) => {
const noteId = data._id
    try {
     const response = await axiosInstance.delete("/delete-note/"+ noteId );
     if(response.data && !response.data.error) {
        showToastMessage(" Xoá ghi chú thành công", "delete")
        getAllNotes()
      }

    } catch (error) {
              // Xử lý lỗi đăng nhập
      if(error.response && error.response.data && error.response.data.message) {
        console.log("Không thể xoá được ghi chú vui lòng thử lại !");
      }
    }
};  
//Search NOTES
const onSearchNote = async (query) => {

    try {
     const response = await axiosInstance.get("/search-notes", {
        params: {query},
     });
     if(response.data && response.data.notes) {
        setIsSearchNotes(true);
        setAllNotes(response.data.notes);
      }

    } catch (error) {     {
        console.log(error);
      }
    }
};


//Pinned Notes
const updateIsPinned = async (noteData) => {
    const noteId = noteData._id
    try {
     const response = await axiosInstance.put("/update-note-pinned/"+ noteId,
        {
            isPinned: !noteData.isPinned,

        } 
     );
     if(response.data && response.data.note) {
        showToastMessage(" Ghi chú được update thành công")
        getAllNotes()
        }

    } catch (error) {
      console.log(error);
    }
    }

const handleClearSearch = () => {
  setIsSearchNotes(false);
  getAllNotes();
};

  useEffect(() => {
    getAllNotes()
    getUserInfo();
    return () => {
    }
  }, [])
  
  return (
    <>
      <Navbar userInfo ={userInfo} onSearchNote ={onSearchNote} handleClearSearch ={handleClearSearch}/>

      <div className='container mx-auto px-20'>
      { allNotes.length > 0 ? (<div className=' grid grid-cols-3 gap-4 mt-8'>
          {allNotes.map((item, index) => (
            <NoteCard
              key={item._id}
              title={item.title}
              date={item.createOn}
              content={item.content}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => handleEdit(item)}
              onDelete={() => deleteNote(item)}
              onPinNote={() => updateIsPinned(item)}
            />
          ))}
        </div>) : (<EmptyCard imgSrc={isSearchNotes ? NoDataImg : AddNotesImg}
         message={isSearchNotes ? `Không có ghi chú nào được tìm thấy trong ghi chú của bạn.` : `Hãy tạo ghi chú đầu tiên của bạn! ấn vào nút 'thêm ghi chú' 
          để ghi lại những ý tưởng, chú ý, lời nhắc của bạn. Hãy bắt đầu nào !`} /> ) }
      </div>

      <button className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10'
       onClick={() =>{
        setopenAddEditModal({ isShown: true, type: "add", data: null });
       }}>
        <MdAdd className='text-[32px] text-white'/>
      </button>

      <Modal 
          isOpen={openAddEditModal.isShown}
          onRequestClose={() => {}}
          style = {{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.2)",
              },
          }}
          contentLabel=""
          className ="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-auto"
          >
        <AddEditNotes
        type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose ={() =>{
          setopenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes ={getAllNotes}
          showToastMessage ={showToastMessage}
          />
      </Modal>

      <Toast 
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home