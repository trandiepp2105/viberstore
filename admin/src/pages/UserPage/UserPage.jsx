import React, { useRef, useEffect, useState } from "react";
import "./UserPage.scss";
import FilterPopup from "../../components/FilterPopup/FilterPopup";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import AcceptancePopup from "../../components/AcceptancePopup/AcceptancePopup";
import userService from "../../services/userService";
// toastify
import { toast } from "react-toastify";
const UserPage = () => {
  const listProductRef = useRef(null);
  const [distanceListProductToBottom, setDistanceListProductToBottom] =
    useState(0);
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      console.log("users", users);
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    const updatePosition = () => {
      if (listProductRef.current) {
        const rect = listProductRef.current.getBoundingClientRect();
        setDistanceListProductToBottom(window.innerHeight - rect.top);
      }
    };

    updatePosition(); // Gọi lần đầu khi component mount
    window.addEventListener("resize", updatePosition); // Cập nhật khi resize

    return () => window.removeEventListener("resize", updatePosition);
  }, []);
  // State lưu trữ filter đang mở
  const [openFilter, setOpenFilter] = useState(false);

  // Hàm toggle filter
  const toggleFilter = () => {
    setOpenFilter(!openFilter);
  };
  const [selectedUser, setSelectedUser] = useState(null);

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);

      toast.success("Delete user successfully");
      fetchUsers();
      handleToggleDeleteUserPopup();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };
  const userColumns = [
    { field: "id", headerName: "ID", width: 0 },
    {
      field: "name",
      headerName: "User Name",
      // width: 180,
      flex: 1.5,
      justifyContent: "center",
      sortable: true, // Không cần sắp xếp
      filterable: true, // Không cần lọc
    },
    {
      field: "phone_number",
      sortable: false,
      filterable: false,
      headerName: "Phone Number",
      flex: 1.5,
    },
    {
      field: "email",
      sortable: false,
      filterable: false,
      headerName: "Email",
      flex: 1.5,
    },
    {
      field: "status",
      headerName: "Status",
      // width: 100,
      flex: 1,
      justifyContent: "center",
      sortable: false, // Không cần sắp xếp
      filterable: false, // Không cần lọc
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          alignItems={"center"}
          gap={1}
        >
          <div className="wrapper-status">
            <p
              className={`status ${
                params.row.status ? "status--active" : "status--inactive"
              }`}
            >
              {params.row.status ? "Active" : "Inactive"}
            </p>
          </div>
        </Box>
      ),
    },
    // {
    //   field: "role",
    //   headerName: "Role",
    //   width: 0,
    //   justifyContent: "center",
    //   sortable: false, // Không cần sắp xếp
    //   filterable: false, // Không cần lọc
    //   renderCell: (params) => (
    //     <Box
    //       width={"100%"}
    //       height={"100%"}
    //       display="flex"
    //       alignItems={"center"}
    //       gap={1}
    //     >
    //       <div className="wrapper-role">
    //         <p
    //           className={`role ${
    //             params.row.role === "admin" ? "role--admin" : "role--customer"
    //           }`}
    //         >
    //           {params.row.role}
    //         </p>
    //       </div>
    //     </Box>
    //   ),
    // },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      //   flex: 0.75,
      justifyContent: "center",
      sortable: false, // Không cần sắp xếp
      filterable: false, // Không cần lọc
      renderCell: (params) => (
        <Box
          width={"100%"}
          height={"100%"}
          display="flex"
          alignItems={"center"}
          gap={2}
        >
          <Link
            to={`/users/${params.row.id}`}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Show products");
            }}
            className="action-detail-link"
            style={{
              color: "#733ab0",
              cursor: "pointer",
              height: "fit-content",
              display: "flex",
              alignItems: "center",
              //   width: "50%",
            }}
          >
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0" />

              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g id="SVGRepo_iconCarrier">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M19.186 2.09c.521.25 1.136.612 1.625 1.101.49.49.852 1.104 1.1 1.625.313.654.11 1.408-.401 1.92l-7.214 7.213c-.31.31-.688.541-1.105.675l-4.222 1.353a.75.75 0 0 1-.943-.944l1.353-4.221a2.75 2.75 0 0 1 .674-1.105l7.214-7.214c.512-.512 1.266-.714 1.92-.402zm.211 2.516a3.608 3.608 0 0 0-.828-.586l-6.994 6.994a1.002 1.002 0 0 0-.178.241L9.9 14.102l2.846-1.496c.09-.047.171-.107.242-.178l6.994-6.994a3.61 3.61 0 0 0-.586-.828zM4.999 5.5A.5.5 0 0 1 5.47 5l5.53.005a1 1 0 0 0 0-2L5.5 3A2.5 2.5 0 0 0 3 5.5v12.577c0 .76.082 1.185.319 1.627.224.419.558.754.977.978.442.236.866.318 1.627.318h12.154c.76 0 1.185-.082 1.627-.318.42-.224.754-.559.978-.978.236-.442.318-.866.318-1.627V13a1 1 0 1 0-2 0v5.077c0 .459-.021.571-.082.684a.364.364 0 0 1-.157.157c-.113.06-.225.082-.684.082H5.923c-.459 0-.57-.022-.684-.082a.363.363 0 0 1-.157-.157c-.06-.113-.082-.225-.082-.684V5.5z"
                  fill="#585a59"
                />
              </g>
            </svg>
          </Link>
          <button
            className="action-detail-link delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(params.row);
              handleToggleDeleteUserPopup();
            }}
            style={{
              color: "#733ab0",
              border: "none",
              background: "none",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0" />

              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M10 12V17"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
                <path
                  d="M14 12V17"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
                <path
                  d="M4 7H20"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
                <path
                  d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
                <path
                  d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                  stroke="#fc1d1d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
              </g>
            </svg>
          </button>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);
  // const users = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     phone_number: "1234567890",
  //     email: "email@gmail.com",
  //     active: false,
  //     role: "admin",
  //   },
  //   {
  //     id: 2,
  //     name: "John Doe",
  //     phone_number: "1234567890",
  //     email: "email@gmail.com",
  //     active: true,
  //     role: "customer",
  //   },
  //   {
  //     id: 3,
  //     name: "John Doe",
  //     phone_number: "1234567890",
  //     email: "email@gmail.com",
  //     active: true,
  //     role: "admin",
  //   },
  //   {
  //     id: 4,
  //     name: "John Doe",
  //     phone_number: "1234567890",
  //     email: "email@gmail.com",
  //     active: true,
  //     role: "customer",
  //   },
  //   {
  //     id: 5,
  //     name: "John Doe",
  //     phone_number: "1234567890",
  //     email: "email@gmail.com",
  //     active: true,
  //     role: "customer",
  //   },
  // ];

  const paginationModel = { page: 0, pageSize: 6 };

  const [isOpenDeleteUserPopup, setIsOpenDeleteUserPopup] = useState(false);

  const handleToggleDeleteUserPopup = () => {
    setIsOpenDeleteUserPopup(!isOpenDeleteUserPopup);
  };
  return (
    <div className="user-page">
      {isOpenDeleteUserPopup && (
        <AcceptancePopup
          description="Are you sure you want to delete this user?"
          handleClose={handleToggleDeleteUserPopup}
          handleAccept={handleDeleteUser}
        />
      )}
      <div className="page-content">
        <div className="header">
          <h3 className="title">Users</h3>
          <div className="actions">
            <Link className="btn btn-add" to={`/users/add-staff`}>
              <svg
                width="10px"
                height="10px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0" />

                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z"
                    fill="#ffffff"
                  />{" "}
                </g>
              </svg>
              Add Staff
            </Link>
            <button className="btn btn-export">
              <svg
                width="10px"
                height="10px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0" />

                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z"
                    fill="#000000"
                  />{" "}
                </g>
              </svg>
              Export
            </button>
          </div>
        </div>
        <div className="quick-access-bar">
          <div className="left-side">
            <div className="filter-order-by-status-bar">
              <button type="button" className="status-item active">
                All Users
              </button>

              <button type="button" className="status-item">
                Role Admin
              </button>

              <button type="button" className="status-item">
                Role Customer
              </button>
            </div>
          </div>
          <div className="right-side">
            <div className="search-bar">
              <span className="wrapper-search-icon">
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <g clip-path="url(#clip0_15_152)">
                      {" "}
                      <rect width="24" height="24" fill="#f0f2f5" />{" "}
                      <circle
                        cx="10.5"
                        cy="10.5"
                        r="6.5"
                        stroke="#000000"
                        stroke-linejoin="round"
                      />{" "}
                      <path
                        d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z"
                        fill="#000000"
                      />{" "}
                    </g>{" "}
                    <defs>
                      {" "}
                      <clipPath id="clip0_15_152">
                        {" "}
                        <rect width="24" height="24" fill="white" />{" "}
                      </clipPath>{" "}
                    </defs>{" "}
                  </g>
                </svg>
              </span>

              <input
                type="text"
                placeholder="Search user by email ..."
                className="search-input"
              />
            </div>
            <div className="wrapper-filter-box">
              <button
                className="toggle-filter-popup-btn"
                type="button"
                onClick={toggleFilter}
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  transform="matrix(1, 0, 0, -1, 0, 0)rotate(90)"
                  stroke="#f0f2f5"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M5 12L5 4"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M19 20L19 17"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M5 20L5 16"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M19 13L19 4"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M12 7L12 4"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M12 20L12 11"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <circle
                      cx="5"
                      cy="14"
                      r="2"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <circle
                      cx="12"
                      cy="9"
                      r="2"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                    <circle
                      cx="19"
                      cy="15"
                      r="2"
                      stroke="#3d3d3d"
                      stroke-linecap="round"
                    />{" "}
                  </g>
                </svg>
                Filter
              </button>

              {openFilter && <FilterPopup />}
            </div>
          </div>
        </div>

        <div
          className="list-user"
          ref={listProductRef}
          style={{
            height: `${distanceListProductToBottom}px`,
          }}
        >
          <Paper
            sx={{
              height: "100%",
              width: "100%",
              border: "none",
              boxShadow: "none !important",
              backgroundColor: "transparent !important",
              "& .css-yseucu-MuiDataGrid-columnHeaderRow": {
                background: "none !important",
              },

              "& .MuiDataGrid-root": {
                border: "none !important", // Bỏ viền bảng
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "transparent", // Bỏ màu nền tiêu đề
                color: "#000",
              },
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: "transparent !important", // Bỏ màu nền khi chọn
              },

              "& .MuiDataGrid-cell": {
                backgroundColor: "transparent", // Bỏ màu nền cell
              },
              "& .MuiDataGrid-row": {
                backgroundColor: "transparent", // Bỏ màu nền hàng
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "transparent", // Bỏ màu nền khi hover
              },
              "& .Mui-checked": {
                color: "#ff5722 !important", // Màu checkbox khi được chọn
              },
            }}
          >
            <DataGrid
              rows={users}
              columns={userColumns}
              initialState={{
                pagination: { paginationModel },
                columns: { columnVisibilityModel: { id: false } }, // Ẩn cột ID
              }} //   pageSizeOptions={[6, 10]}
              checkboxSelection
              // sx={{
              //   border: 0,
              //   "--height": "50px",
              //   "& .MuiDataGrid-row": {
              //     cursor: "pointer",
              //     height: "50px !important",
              //     minHeight: "50px !important",
              //     maxHeight: "50px !important",
              //   },
              //   "& .MuiDataGrid-cell": {
              //     height: "50px !important",
              //   },
              // }}
              sx={{
                border: 0,
                "--height": "45px",
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
                  height: "45px !important",
                  minHeight: "45px !important",
                  maxHeight: "45px !important",
                },
                "& .MuiDataGrid-cell": {
                  height: "45px !important",
                },
              }}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
