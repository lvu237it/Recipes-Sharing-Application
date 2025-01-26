const handleCreatePost = async () => {
  // console.log('images.length', images.length);
  // console.log('number chracter allow', numberCharactersAllowed);
  // if (postContent.length > 100000) {
  //   toast.error(
  //     'Đăng bài không thành công. Nội dung bài đăng không được vượt quá 100000 kí tự 😿.'
  //   );
  //   return;
  // }

  // if (images.length > 10) {
  //   toast.error('Đăng bài không thành công. Tối đa không quá 10 ảnh 😿.');
  //   return;
  // }

  try {
    // Tải ảnh lên Cloudinary
    // const imageUrls = await Promise.all(
    //   images.map(async (file) => {
    //     const url = await uploadImageToCloudinary(file);
    //     return url;
    //   })
    // );
    // console.log('imageurlsall', imageUrls);
    // const postData = {
    //   content: postContent,
    //   user_id: currentUserInfor.user_id,
    //   images_array: JSON.stringify(imageUrls), // Chuyển mảng ảnh thành chuỗi JSON
    // };
    // await axios.post(`${apiBaseUrl}/posts/createpost`, postData, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
    // setPostModal(false);
    // textareaRef.current.value = '';
    // setHasPostContent(false);
    // setPostContent('');
    // getAllPostsExceptMe();
    // getAllMyPosts();
    // setImageUrlsList([]);
    // setImages([]);
    // // const lastestPost = await getLastestPostCreatedByMe(currentUserInfor);
    // toast.success(
    //   <div>
    //     Đăng bài thành công 😸! Hãy xem bài viết mới nhất của bạn tại
    //     <div
    //       onClick={() => {
    //         setHeaderIconsClicked('header-icon-profile');
    //         navigate('/profile');
    //       }}
    //       className='cursor-pointer hover:text-blue-500 text-blue-400 ease-in-out duration-300'
    //     >
    //       trang cá nhân
    //     </div>
    //   </div>
    // );
  } catch (error) {
    console.error('Error creating post', error);
    setPostModal(false);
    toast.error('Đăng bài không thành công. Vui lòng thử lại 😿.');
  }
};
