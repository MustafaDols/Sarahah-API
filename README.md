# Sarahah-API  
A RESTful API for anonymous messaging and user management, built using **Node.js, Express, and MongoDB Atlas**. This API supports authentication, account management, and secure message handling.  

---

## 📚 Features  

### 👤 User APIs  
- `POST /users/signup` → Register new user with validations  
- `POST /users/signin` → Login with email & password  
- `PUT /users/confirm` → Confirm email via token  
- `POST /users/logout` → Logout and blacklist token  
- `POST /users/refresh-token` → Refresh access token  
- `POST /users/auth-gmail` → Google login  

### 🔑 Password APIs  
- `PUT /users/forgotPassword` → Request password reset (email)  
- `PUT /users/resetPassword` → Reset password with token  

### 📝 Profile APIs  
- `PUT /users/update` → Update account details  
- `DELETE /users/delete/:userId` → Delete account by ID  
- `POST /users/upload-profile` → Upload profile picture (Multer + Cloudinary)  
- `DELETE /users/delete-profile` → Delete profile picture  

### 🛡️ Admin APIs  
- `GET /users/list` → List all users (Admin/Super Admin only)  

### 💬 Message APIs  
- `POST /messages` → Send anonymous message  
- `GET /messages/:userId` → Get user’s messages  

---

## 🛠️ Technologies  
- **Node.js**  
- **Express.js**  
- **MongoDB Atlas** (Mongoose ODM)  
- **Multer + Cloudinary** (file uploads)  
- **JWT + bcrypt** (authentication & security)  
- **Nodemailer (SMTP Gmail)** (emails)  
- **Rate Limiter + Helmet** (protection)  

---

## ✅ Validations  
- Email format validation  
- Password strength validation (bcrypt + schema rules)  
- Role-based access control (Admin, Super Admin, User)  
- Token blacklisting for logout  

---

## 🧪 Postman Collection
You can test all the API endpoints using the Postman collection:

👉 [Click here to access the Postman collection](https://documenter.getpostman.com/view/45585304/2sB3HeuP6E)
