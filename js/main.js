// THE URL "https://tarmeezacademy.com/api/v1"
const baseURL = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;

// ===== INFINATE SCROLL HANDLING =====
window.addEventListener("scroll", function () {
  const endOfPage =
    window.innerHeight + window.scrollY + 5 >= document.body.scrollHeight;

  if (endOfPage == true && currentPage < lastPage) {
    currentPage = currentPage + 1;
    getPosts(false, currentPage);
  }
});

setupUI();

getPosts();
// POSTS REQUEST
function getPosts(reload = true, page = 1) {
  toggleLoader(true);
  axios.get(`${baseURL}/posts?page=${page}`).then((response) => {
    toggleLoader(false);

    const posts = response.data.data;
    lastPage = response.data.meta.last_page;

    if (document.getElementById("posts") != null) {
      if (reload) {
        document.getElementById("posts").innerHTML = "";
      }
    }

    for (post of posts) {
      let postTitle = "";
      if (post.title != null) {
        postTitle = post.title;
      }

      // show or hide (edit & delete) btn
      let user = getCurrentUser();
      let isMyPost = user != null && user.id == post.author.id;
      let editBtnStatus = ``;

      if (isMyPost) {
        editBtnStatus = "visible";
      } else {
        editBtnStatus = "hidden";
      }

      let content = `
    <div class="card shadow mt-3">
              <div class="card-header d-flex justify-content-between">
                <div onclick="userClicked(${post.author.id})" style="cursor: pointer">
                    <img
                    src="${post.author.profile_image}"
                    alt=""
                    class="rounded-circle border border-2 p-1"
                    id="user-img"
                  />
                  <b>@${post.author.username}</b>
                </div>

                <div>
                  <button class ="btn btn-outline-danger" style="float: right; visibility: ${editBtnStatus};" onclick="deletePostBtnClicked(${post.id})">Delete</button>
                  <button class="btn btn-outline-secondary" style="float: right; margin-right: 5px; visibility: ${editBtnStatus};" onclick="editPostBtnClicked(${post.id})">Edit</button>
                </div>
              </div>
              <div class="card-body" onclick="postClicked(${post.id})" style="cursor: pointer;">
                <img
                  src="${post.image}"
                  alt="placeholder"
                  class="w-100"
                />
                <h6 class="mt-1" id="post-time">${post.created_at}</h6>
                <h5>${postTitle}</h5>
                <p>
                  ${post.body}
                </p>
                <hr />
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-pen"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"
                    />
                  </svg>
                  <span>${post.comments_count} comments</span>
                </div>
              </div>
            </div>
    `;
      if (document.getElementById("posts") != null) {
        document.getElementById("posts").innerHTML += content;
      }
    }
  });
}

// REGISTER REQUEST
function registerBtnClicked() {
  const userName = document.getElementById("register-username-input").value;
  const passWord = document.getElementById("register-password-input").value;
  const passWordConfirm = document.getElementById(
    "confirm-register-password-input"
  ).value;
  const name = document.getElementById("register-name-input").value;
  const image = document.getElementById("register-image-input").files[0];

  //form data params
  const form = new FormData();
  form.append("username", userName);
  form.append("password", passWord);
  form.append("name", name);
  form.append("image", image);

  if (passWord === passWordConfirm) {
    axios
      .post(`${baseURL}/register`, form)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // ==================================================================
        // Close register modal
        const registerModal = document.getElementById("register-modal");
        const registerModalInstance =
          bootstrap.Modal.getInstance(registerModal);
        registerModalInstance.hide();
        // ==================================================================
        showSuccessAlert("Registerd successfully");

        setTimeout(() => {
          setupUI();
        }, 3000);
      })
      .catch((error) => {
        const errorMsg = error.response.data.message;
        Swal.fire(errorMsg);
      });
  } else {
    Swal.fire("Password does not match");
  }
}
// LOGIN REQUEST
function loginBtnClicked() {
  const userName = document.getElementById("username-input").value;
  const passWord = document.getElementById("password-input").value;
  const helloMsg = document.getElementById("hello-msg");

  axios
    .post(`${baseURL}/login?username=${userName}&password=${passWord}`)
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      helloMsg.innerHTML = `Hello ${response.data.user.name}`;

      // ==================================================================
      // Close login modal
      const loginModal = document.getElementById("login-modal");
      const loginModalInstance = bootstrap.Modal.getInstance(loginModal);
      loginModalInstance.hide();
      // ==================================================================
      showSuccessAlert("Logged in successfully");

      setTimeout(() => {
        setupUI();
        getPosts();
      }, 3000);
    })
    .catch((error) => {
      const errorMsg = error.response.data.message;
      Swal.fire(errorMsg);
    });
}

// LOGIN, REGISTER AND CREATE-POST SUCCESS ALERT
function showSuccessAlert(successMsg) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: "success",
    title: successMsg,
  });
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  showLogoutAlert();

  setTimeout(() => {
    setupUI();
    window.location = "index.html";
  }, 1500);
}

// LOGOUT SUCCESS ALERT
function showLogoutAlert() {
  Swal.fire({
    position: "center",
    icon: "success",
    title: "logged out successfully",
    showConfirmButton: false,
    timer: 1500,
  });
}

// CREATE A NEW POST
function createNewPostClicked() {
  let postId = document.getElementById("post-id-input").value;
  let isCreate = postId == null || postId == "";

  const title = document.getElementById("post-title").value;
  const description = document.getElementById("post-description").value;
  const image = document.getElementById("post-image").files[0];

  // form data
  const form = new FormData();

  form.append("body", description);
  form.append("title", title);
  form.append("image", image);

  const token = localStorage.getItem("token");
  const headers = {
    authorization: `Bearer ${token}`,
  };

  if (isCreate) {
    axios
      .post(`${baseURL}/posts`, form, {
        headers: headers,
      })
      .then((response) => {
        // ==================================================================
        // Close login modal
        const postModal = document.getElementById("create-post-modal");
        const postModalInstance = bootstrap.Modal.getInstance(postModal);
        postModalInstance.hide();
        // ==================================================================

        showSuccessAlert("Your post has been added");
        setTimeout(() => {
          getPosts();
        }, 3000);
      })
      .catch((error) => {
        const errorMsg = error.response.data.message;
        Swal.fire(errorMsg);
      });
  } else {
    form.append("_method", "put");

    axios
      .post(`${baseURL}/posts/${postId}`, form, {
        headers: headers,
      })
      .then((response) => {
        // ==================================================================
        // Close login modal
        const postModal = document.getElementById("create-post-modal");
        const postModalInstance = bootstrap.Modal.getInstance(postModal);
        postModalInstance.hide();
        // ==================================================================

        showSuccessAlert("Your post has been added");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      })
      .catch((error) => {
        Swal.fire(error);
      });
  }
}

// SETUP UI
function setupUI() {
  const token = localStorage.getItem("token");

  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userInfo = document.getElementById("user-info");
  const navbarUserImg = document.getElementById("navbar-user-image");
  const helloMsg = document.getElementById("hello-msg");
  const createPostBtn = document.getElementById("create-post-btn");

  const user = getCurrentUser();

  if (token == null) {
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    logoutBtn.style.display = "none";
    userInfo.style.display = "none";
    if (createPostBtn != null) {
      createPostBtn.style.display = "none";
    }
  } else {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "block";
    userInfo.style.display = "block";
    if (createPostBtn != null) {
      createPostBtn.style.display = "block";
    }

    navbarUserImg.src = user.profile_image;
    helloMsg.innerHTML = `Hello ${user.name}`;
  }
}

// GET CURRENT USER (THE LOOGED IN USER)
function getCurrentUser() {
  let user = null;
  const storageUser = localStorage.getItem("user");

  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }

  return user;
}

// TO GET POST ID [1]
let thePostIdNumber = "";
let PostRegEx = /postId=\d+\b/gi;

// TO GET POST ID [2]
function postID() {
  if (PostRegEx.test(window.location.href.toString())) {
    const urlParams = new URLSearchParams(window.location.search);
    thePostIdNumber = urlParams.get("postId");
  }
  return thePostIdNumber;
}

postID();

// CLICK ON POST TO SHOW A SPECIFIC POST
function postClicked(postId) {
  window.location = `post-details.html?postId=${postId}`;
}

getSpecificPost();

//GET A SPECIFIC POST REQUEST
function getSpecificPost() {
  axios.get(`${baseURL}/posts/${thePostIdNumber}`).then((response) => {
    const post = response.data.data;
    const comments = post.comments;
    const author = post.author;

    document.getElementById("author-name").innerHTML = author.name;

    let postTitle = "";
    if (post.title != null) {
      postTitle = post.title;
    }

    let commentsContent = "";
    for (comment of comments) {
      commentsContent += `
        <div class="comment p-2 shadow">
              <div class="comment-author">
                      <img src="${comment.author.profile_image}" class="rounded-circle border border-2 p-1 author-img"
                        style="border-color: #ccc !important;" alt=""
                      >

                    <b style="color: #444;">@${comment.author.username}</b>
              </div>
              <div class="comment-content ms-3 me-3">
                  <p>${comment.body}</p>
              </div>
        </div>      
      `;
    }

    // show or hide (edit & delete) btn
    let user = getCurrentUser();
    let isMyPost = user != null && user.id == post.author.id;
    let editBtnStatus = ``;

    if (isMyPost) {
      editBtnStatus = "visible";
    } else {
      editBtnStatus = "hidden";
    }

    let postContent = `
    <div class="card shadow mt-3">
      <div class="card-header d-flex justify-content-between">
          <div onclick="userClicked(${post.author.id})" style="cursor: pointer">
            <img src="${author.profile_image}" alt="User" class="rounded-circle border border-2 p-1"
            id="user-img" />
            <b>@${author.username}</b>
          </div>

          <div>
            <button class ="btn btn-outline-danger" style="float: right; visibility: ${editBtnStatus};" onclick="deletePostBtnClicked(${post.id})">Delete</button>
            <button class="btn btn-outline-secondary" style="float: right; margin-right: 5px; visibility: ${editBtnStatus};" onclick="editPostBtnClicked(${post.id})">Edit</button>
          </div>
      </div>
      <div class="card-body">
          <img src="${post.image}" alt="placeholder" class="w-100" id="post-image" />
          <h6 class="mt-1" id="post-time">${post.created_at}</h6>
          <h5>${postTitle}</h5>
          <p>
              ${post.body}
          </p>
          <hr />
          <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-pen" viewBox="0 0 16 16">
                  <path
                      d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z" />
              </svg>
              <span>${post.comments_count} comments</span>
          </div>
      </div>
  </div>
      `;

    document.getElementById("post-card").innerHTML = postContent;
    document.getElementById("comments").innerHTML = commentsContent;
  });
}

// CREATE COMMENT
function createCommentClicked() {
  let commentContent = document.getElementById("comment-input").value;
  let params = {
    body: commentContent,
  };
  let token = localStorage.getItem("token");
  let url = `${baseURL}/posts/${thePostIdNumber}/comments`;

  axios
    .post(url, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      showSuccessAlert("Your comment has been added");
      getSpecificPost();
    })
    .catch((error) => {
      const errorMsg = error.response.data.message;
      document.getElementById("comment-input").focus();
      Swal.fire(errorMsg);
    });
  document.getElementById("comment-input").value = "";
}

// EDIT POST REQUEST
function editPostBtnClicked(id) {
  axios.get(`${baseURL}/posts/${id}`).then((response) => {
    let post = response.data.data;
    let postId = post.id;
    let postTitle = post.title;
    let postBody = post.body;

    document.getElementById("post-id-input").value = postId;

    document.getElementById("post-modal-title").innerHTML = "Edit Post";
    document.getElementById("post-title").value = postTitle;
    document.getElementById("post-description").value = postBody;
    let postModal = new bootstrap.Modal(
      document.getElementById("create-post-modal"),
      {}
    );
    postModal.toggle();
  });
}

// CREATE POST (BTN) ONCLICK
function createPostBtnClicked() {
  document.getElementById("post-id-input").value = "";

  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  document.getElementById("post-title").value = "";
  document.getElementById("post-description").value = "";
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  postModal.toggle();
}

// DELETE POSTS REQUEST
function deletePostBtnClicked(id) {
  Swal.fire({
    title: "Are you sure you want to delete this post?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff0000",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "Your post has been deleted.",
        icon: "success",
      });
      let token = localStorage.getItem("token");

      axios
        .delete(`${baseURL}/posts/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setTimeout(() => {
            window.location = "index.html";
          }, 1500);
        })
        .catch((error) => {
          Swal.fire("You are unauthorized");
        });
    }
  });
}

// TO GET CLICKED USER ID [1]
let theUserIdNumber = "";
let userRegEx = /userid=\d+\b/gi;

// TO GET CLICKED USER ID [2]
function userID() {
  if (userRegEx.test(window.location.href.toString())) {
    const urlParams = new URLSearchParams(window.location.search);
    theUserIdNumber = urlParams.get("userId");
  }
  return theUserIdNumber;
}

userID();

// GET USER REQUEST
getUser();
getUserPosts();

// [1] get user's info
function getUser() {
  const userId = theUserIdNumber;
  axios.get(`${baseURL}/users/${userId}`).then((response) => {
    const userInfo = response.data.data;

    document.getElementById("user-main-info").innerHTML = "";

    let userInfoContent = `
    <div class="d-flex justify-content-center mt-5">
            <div class="col-9">
                <!-- user info -->
                <div class="card shadow mt-3">
                    <div class="card-body">
                        <div class="row user-head-info">
                            <div class="col-2 profile-img-container">
                                <img src="${
                                  userInfo.profile_image
                                }" id="profile-img">
                            </div>
                            <div class="col-4 d-flex flex-column justify-content-around"
                                style="font-weight: 700; font-size: 15px;">
                                <div>${userInfo.email || ""}</div>
                                <div>${userInfo.name || ""}</div>
                                <div>@${userInfo.username || ""}</div>
                            </div>
                            <div class="col-4 d-flex flex-column justify-content-around">
                                <div class="stats"><span>${
                                  userInfo.posts_count
                                }</span> Posts</div>
                                <div class="stats"><span>${
                                  userInfo.comments_count
                                }</span> comments</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--/ user info /-->
            </div>
        </div>
    `;
    document.getElementById("user-main-info").innerHTML = userInfoContent;
  });
}

// [2] get user posts
function getUserPosts() {
  let userId = theUserIdNumber;
  axios.get(`${baseURL}/users/${userId}/posts`).then((response) => {
    const posts = response.data.data;

    document.getElementById("title-user-name").innerHTML = "";
    document.getElementById("title-user-name").innerHTML = posts[0].author.name;

    document.getElementById("user-all-posts").innerHTML = "";

    for (post of posts) {
      let postTitle = "";
      if (post.title != null) {
        postTitle = post.title;
      }

      // show or hide (edit & delete) btn
      let user = getCurrentUser();
      let isMyPost = user != null && user.id == post.author.id;
      let editBtnStatus = ``;

      if (isMyPost) {
        editBtnStatus = "visible";
      } else {
        editBtnStatus = "hidden";
      }

      let postContent = `
      <div class="d-flex justify-content-center mt-5">
            <div class="col-9">
                <!-- POST -->
                <div class="card shadow mt-3">
                    <div class="card-header">
                        <img src="${post.author.profile_image}" class="rounded-circle border border-2 p-1"
                            id="user-img" />
                        <b>@${post.author.username}</b>
                        <button class ="btn btn-outline-danger" style="float: right; visibility: ${editBtnStatus};" onclick="deletePostBtnClicked(${post.id})">Delete</button>
                        <button class="btn btn-outline-secondary" style="float: right; margin-right: 5px; visibility: ${editBtnStatus};" onclick="editPostBtnClicked(${post.id})">Edit</button>
                    </div>
                    <div class="card-body">
                        <img src="${post.image}" class="w-100" />
                        <h6 class="mt-1" id="post-time">${post.created_at}</h6>
                        <h5>${post.title}</h5>
                        <p>
                            ${post.body}
                        </p>
                        <hr />
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-pen" viewBox="0 0 16 16">
                                <path
                                    d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z" />
                            </svg>
                            <span>${post.comments_count} Comments</span>
                        </div>
                    </div>
                </div>
                <!--/ POST /-->
            </div>
        </div>
      `;
      document.getElementById("user-all-posts").innerHTML += postContent;
    }
  });
}

// USER IMAGE AND USERNAME ONCLICK
function userClicked(userId) {
  window.location = `profile.html?userId=${userId}`;
}

// PROFILE CLICKED
function profileClicked() {
  if (localStorage.getItem("user") != null) {
    const user = getCurrentUser();
    window.location = `profile.html?userId=${user.id}`;
  } else {
    Swal.fire("You are not logged in");
  }
}

// LOADER TOGGLE FINCTION
function toggleLoader(show = true) {
  if (show) {
    document.getElementById("loader").style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}

// SCROLL TO TOP BUTTON
let scrollBtn = document.querySelector("#scroll-to-top button");

window.onscroll = function () {
  if (window.scrollY >= 600) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
};

scrollBtn.onclick = function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
