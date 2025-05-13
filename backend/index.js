require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

const User = require("./models/user.model");
const Note = require("./models/note.model");


mongoose.connect(config.connectionString);

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const {authenticateToken} = require("./utilities");


app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);

app.get("/", (req, res) => {
    res.json({ data: "hello" });
});
//Back end 

//API-tạo tài khoản
app.post("/create-account", async (req, res) => {
    const {fullName, email, password } = req.body;

    if (!fullName) {
        return res.status(400).json({error: true, message: "Yêu cầu điền Tên của bạn"})
    }

    if (!email) {
        return res.status(400).json({error: true, message: "Yêu cầu điền Email của bạn"})
    }

    if (!password) {
        return res.status(400).json({error: true, message: "Yêu cầu điền Password của bạn"})
    }

    const isUser = await User.findOne({email: email});

    if (isUser) {
        return res.json({
            error: true,
            message: "User already exits",
        });
    }

    const user = new User({
        fullName,
        email,
        password,
    });

    await user.save();

    const accessToken = jwt.sign({user},
                        process.env.ACCESS_TOKEN_SECRET, 
                        {expiresIn: "36000m",}
        );

        return res.json({
            error: false,
            user,
            accessToken,
            message: "Đăng ký hoàn tất"
        })
});

//API đăng nhập
app.post("/login", async (req, res) => {
    const { email, password } = req.body;


    if (!email) {
        return res.status(400).json({message: "Email chưa chính xác"})
    }

    if (!password) {
        return res.status(400).json({message: "Mật khẩu chưa chính xác"})
    }

    const userInfo = await User.findOne({email: email});

    if (!userInfo) {
        return res.status(400).json({message: "Người dùng chưa đăng ký"})
    }

    if (userInfo.email == email && userInfo.password == password) {
        const user = {user: userInfo}; 
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });
        return res.json({
            error: false,
            email,
            message: "Đăng nhập thành công",
            accessToken
        });
    } else {
        return res.status(400).json({
            error: true,
            message: "Tài khoản không hợp lệ vui lòng thử lại !!!"
        })
    }
});

//API Get user
app.get("/get-user",authenticateToken, async (req, res) => {
    const { user } = req.user;
    const isUser = await User.findOne({_id: user._id});
    
    if(!isUser) {
        return res.sendStatus(401);
    }
        return res.json({
        user: {fullName: isUser.fullName, email: isUser.email, "_id": isUser._id, createOn: isUser.createOn},
        message: ""
     });
});

//API Thêm ghi chú notes
app.post("/add-note",authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    if (!title) {
        return res.status(400).json({error: true, message: "Chưa nhập tiêu đề!"})
    }

    if (!content) {
        return res.status(400).json({error: true, message: "Chưa nhập nội dung!"})
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id,
        });

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Thêm ghi chú thành công"
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Ghi chú không được thêm"
        });                                                                                                                                 
    }
});

//API chỉnh sửa ghi chú notes
app.put("/edit-note/:nodeId",authenticateToken, async (req, res) => {
    const noteId = req.params.nodeId;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    if (!title && !content && !tags) {
        return res.status(400).json({error: true, message: "Không có nội dung nào được thay đổi"})
    }

    try {
        const note = await Note.findOne({_id: noteId, userId: user._id});
        if (!note) {
            return res.status(404).json({
            error: true,
            message: "Không tìm được ghi chú phù hợp"
            }); 
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Chỉnh sửa ghi chú thành công"
        });

    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Ghi chú không được chỉnh sửa"
        });                                                                                                                                 
    }
});

//API get all notes
app.get("/get-all-notes/",authenticateToken, async (req, res) => {
    const { user } = req.user;



    try {
        const notes = await Note.find({userId: user._id}).sort({isPinned: -1});

        return res.json({
            error: false,
            notes,
            message: "Tất cả các ghi chú đã được thêm thành công"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Không ghi chú nào được thêm"
        });                                                                                                                                 
    }
});

//API Xoá ghi chú
app.delete("/delete-note/:nodeId",authenticateToken, async (req, res) => {
    const noteId = req.params.nodeId;
    const { user } = req.user;

    try {
        const note = await Note.findOne({_id: noteId, userId: user._id});
        if (!note) {
            return res.status(404).json({
            error: true,
            message: "Không tìm được ghi chú để xoá"
            }); 
        }
        await Note.deleteOne({_id: noteId, userId: user._id})

        return res.json({
            error: false,         
            message: "Xoá ghi chú thành công"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Ghi chú không được xoá"
        });                                                                                                                                 
    }
});

//API Ghim ghi chú
app.put("/update-note-pinned/:nodeId",authenticateToken, async (req, res) => {
    const noteId = req.params.nodeId;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const note = await Note.findOne({_id: noteId, userId: user._id});
        if (!note) {
            return res.status(404).json({
            error: true,
            message: "Không tìm được ghi chú phù hợp"
            }); 
        }

        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Ghim ghi chú thành công"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Ghi chú không được ghim"
        });                                                                                                                                 
    }
});

//API Tìm ghi chú
app.get("/search-notes",authenticateToken, async (req, res) => {
    const { query } = req.query;
    const { user } = req.user;

    if(!query) {
        return res
        .status(400)
        .json ({ error: true, message: "Không tìm thấy được ghi chú"});
    }

    try {
        const matchingNotes = await Note.find({ userId: user._id, 
        $or: [{
            title: {$regex: new RegExp(query, 'i')}},
            {content: {$regex:new RegExp(query, 'i')}},
        ],
    });

    return res.json({
        error: false,
        notes: matchingNotes,
        message: "Đã tìm được ghi chú"
    });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Ghi chú không tồn tại"
        });                                                                                                                                 
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = app