const app = new Vue({
  el: "#app",
  data() {
    // 校验学号是否存在
    const rulesSno = (rule, value, callback) => {
      if (this.isEdit) {
        // 修改时候不需校验学号，直接callback返回
        callback();
      }
      // 使用axios进行校验
      axios
        .post(this.baseURL + "sno/check/", {
          sno: value,
        })
        .then((res) => {
          // 请求成功
          if (res.data.code === 1) {
            if (res.data.exists) {
              callback(new Error("学号已存在！"));
            } else {
              callback();
            }
          } else {
            // 请求失败
            callback(new Error("请求学号客户端异常！"));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
    return {
      msg: "Hello,Vue!",
      baseURL: "http://192.168.72.18:8000/",
      students: [],
      selectStudents: [], //选择复选框时把记录存放在此集合
      inputStr: "", //输入的查询条件
      pagesize: 5,
      pageStudents: [], //分页后当前页的学生信息
      total: 0, //数据总行数
      currentpage: 1,
      dialogVisible: false,
      DialogTitle: "",
      isView: false, //标识是否可查看
      isEdit: false, //标识是否可编辑
      studentForm: {
        sno: "",
        name: "",
        gender: "",
        address: "",
        email: "",
        birthday: "",
        mobile: "",
        image: "",
        imageUrl: "",
      },
      rules: {
        sno: [
          {
            required: true,
            message: "学号不能为空",
            trigger: "blur",
          },
          {
            validator: rulesSno,
            trigger: "blur",
          },
        ],
        name: [
          {
            required: true,
            message: "姓名不能为空",
            trigger: "blur",
          },
          {
            pattern: /^[\u4e00-\u9fa5]{2,15}$/,
            message: "姓名必须是2-5个汉字",
            trigger: "blur",
          },
        ],
        gender: [
          {
            required: true,
            message: "性别不能为空",
            trigger: "change",
          },
        ],
        birthday: [
          {
            required: true,
            message: "出生日期不能为空",
            trigger: "change",
          },
        ],
        mobile: [
          {
            required: true,
            message: "手机号码不能为空",
            trigger: "blur",
          },
          {
            pattern: /^[1][35789]\d{9}$/,
            message: "手机号码格式不正确",
            trigger: "blur",
          },
        ],
        email: [
          {
            required: true,
            message: "Email地址不能为空",
            trigger: "blur",
          },
          {
            pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
            message: "Email格式不正确",
            trigger: "blur",
          },
        ],
        address: [
          {
            required: true,
            message: "家庭住址地址不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  mounted() {
    // 页面自动加载数据
    this.getStudents();
  },
  methods: {
    // 获取所有学生信息数据
    getStudents: function () {
      // 记录this的地址
      let that = this;
      // 使用Axios实现Ajax请求
      axios
        .get(that.baseURL + "students/")
        .then(function (res) {
          // 请求成功后执行的函数
          if (res.data.code === 1) {
            // 把数据给students
            that.students = res.data.data;
            // 获取返回记录的总行数
            that.total = res.data.data.length;
            // 获取当前页的数据
            that.getPageStudents();
            // 提示成功
            that.$message({
              message: "数据加载成功！",
              type: "success",
            });
          } else {
            that.$message.error(res.data.msg);
          }
        })
        .catch(function (err) {
          console.log(err.response.data.msg);
        });
    },
    // 获取当前页的学生数据
    getPageStudents: function () {
      // 清空pageStudents中的数据
      this.pageStudents = [];
      // 获得当前页的数据
      for (
        let i = (this.currentpage - 1) * this.pagesize;
        i < this.total;
        i++
      ) {
        // 遍历数据添加到pageStudent中
        this.pageStudents.push(this.students[i]);
        // 判断是否达到一页
        if (this.pageStudents.length === this.pagesize) break;
      }
    },
    // 查询
    queryStudents() {
      // 使用Ajax请求 POST->传递inputStr
      let that = this;
      // 开始Ajax请求
      axios
        .post(that.baseURL + "students/query/", {
          inputstr: that.inputStr,
        })
        .then(function (res) {
          if (res.data.code === 1) {
            // 把数据给students
            that.students = res.data.data;
            // 获取返回记录的总行数
            that.total = res.data.data.length;
            // 获取当前页的数据
            that.getPageStudents();
            // 提示成功
            that.$message({
              message: "查询数据加载成功！",
              type: "success",
            });
          } else {
            that.$message.error(res.data.msg);
          }
        })
        .catch(function (err) {
          console.log(err);
          that.$message.error("获取后端查询接口出现异常！");
        });
    },
    // 分页时修改每页的行数
    handleSizeChange(size) {
      // 修改当前每页数据行数
      this.pagesize = size;
      // 数据重新分页
      this.getPageStudents();
    },
    // 调整当前页码
    handleCurrentChange(pageNumber) {
      // 修改当前页码
      this.currentpage = pageNumber;
      // 数据重新分页
      this.getPageStudents();
    },
    // 添加学生打开表单
    addStudent() {
      this.DialogTitle = "添加学生明细";
      this.dialogVisible = true;
    },
    // 根据id获取image
    getImageBySno(sno) {
      // 遍历
      for (oneStudent of this.students) {
        // 判断
        if (oneStudent == sno) {
          return oneStudent.image;
        }
      }
    },
    // 查看学生明细并打开表单
    viewStudent(row) {
      this.DialogTitle = "查看学生明细";
      // 结合disabled，这里开启isView后，index.html disabled，这样就不能修改value了
      // 修改isView变量
      this.isView = true;
      // 弹出表单
      this.dialogVisible = true;
      // 获取照片
      this.studentForm.image = this.getImageBySno(row.sno);
      // 获取图片Url
      this.studentForm.imageUrl = this.baseURL + 'media/' + this.studentForm.image;

      // 深拷贝02
      this.studentForm = JSON.parse(JSON.stringify(row));
    },
    // 每次关闭弹出框表单，清空内容
    clearDialogForm(formName) {
      // 重置表单校验
      this.$refs[formName].resetFields();
      // 清空
      this.studentForm.sno = "";
      this.studentForm.name = "";
      this.studentForm.gender = "";
      this.studentForm.birthday = "";
      this.studentForm.mobile = "";
      this.studentForm.email = "";
      this.studentForm.address = "";
      this.studentForm.sno = "";
      this.studentForm.image = "";
      this.studentForm.imageUrl = "";
      // 关闭框
      this.dialogVisible = false;
      // 格式化isEdit和isView
      this.isEdit = false;
      this.isView = false;
    },
    //选择学生头像后点击确定要触发的事情
    uploadPicturePost(file) {
      let that = this;
      // 定义formData类
      let fileReq = new FormData();
      // 传照片进去
      fileReq.append("avatar", file.file);
      // 使用Axios发起Ajax请求
      axios({
        method: "post",
        url: that.baseURL + "upload/",
        data: fileReq,
      })
        .then((res) => {
          // 根据code判断是否成功
          if (res.data.code === 1) {
            // 把照片给image
            that.studentForm.image = res.data.name;
            // 根据名称拼接
            that.studentForm.imageUrl = that.baseURL + "media/" + res.data.name;
          } else {
            that.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message.error("上传头像出现异常！");
        });
    },
    uploadExcelPost(file) {
      let that = this;
      let fileReq = new FormData();
      fileReq.append("excel", file.file);

      axios({
        method: "post",
        url: that.baseURL + "excel/import/",
        data: fileReq,
      })
        .then((res) => {
          if (res.data.code === 1) {
            that.students = res.data.data;
            that.total = res.data.data.length;
            that.getPageStudents();

            this.$alert(
              "本次导入完成，成功" +
                res.data.success +
                "失败" +
                res.data.error +
                ",导入结果展示",
              {
                confirmButtonText: "确定",
                callback: (action) => {
                  this.$message({
                    type: "info",
                    message:
                      "本次导入失败数量为：" +
                      res.data.error +
                      "，具体的学号为：" +
                      res.data.errors,
                  });
                },
              }
            );

            console.log(
              "本次导入失败数目为：" + res.data.error + " 具体学号："
            );
            console.log(res.data.errors);
          } else {
            that.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message.error("上传数据出现异常！");
        });
    },
    // 提交学生的表单（应用于添加、修改两个的弹出框中）
    submitStudentForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 修改
          if (this.isEdit) {
            this.submitUpdateStudent();
          } else {
            // 添加
            this.submitAddStudent();
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 添加到数据库
    submitAddStudent() {
      let that = this;
      axios
        .post(that.baseURL + "student/add/", that.studentForm)
        .then((res) => {
          // 执行成功
          if (res.data.code === 1) {
            //获取所有学生的信息
            that.students = res.data.data;
            // 获取记录条数
            that.total = res.data.data.length;
            // 获取分页信息
            that.getPageStudents();
            // 提示
            that.$message({
              message: "添加数据加载成功！",
              type: "success",
            });
            that.clearDialogForm("studentForm");
          } else {
            that.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          // 执行失败
          console.log(err);
          that.$message.error("获取后端查询结果出现异常！");
        });
    },
    submitUpdateStudent() {
      let that = this;
      axios
        .post(that.baseURL + "student/update/", that.studentForm)
        .then((res) => {
          // 执行成功
          if (res.data.code === 1) {
            //获取所有学生的信息
            that.students = res.data.data;
            // 获取记录条数
            that.total = res.data.data.length;
            // 获取分页信息
            that.getPageStudents();
            // 提示
            that.$message({
              message: "修改数据加载成功！",
              type: "success",
            });
            that.clearDialogForm("studentForm");
          } else {
            that.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          // 执行失败
          console.log(err);
          that.$message.error("修改时获取后端获取结果出现异常！");
        });
    },

    // 修改学生信息打开表单
    updateStudent(row) {
      this.DialogTitle = "修改学生明细";

      // 弹出表单
      this.dialogVisible = true;
      // 修改isEdit
      this.isEdit = true;
      // 拷贝数据显示
      this.studentForm = JSON.parse(JSON.stringify(row));
    },
    // 删除学生信息
    deleteStudent(row) {
      this.$confirm(
        "确认删除学号为 " +
          row.sno +
          " 姓名为 " +
          row.name +
          "\t的学生信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          // 确认删除再来弹窗
          let that = this;
          // 调用后端接口;

          axios
            .post(that.baseURL + "student/delete/", { sno: row.sno })
            .then((res) => {
              // 有这个学生数据
              if (res.data.code === 1) {
                // 获取所有的学生信息
                that.students = res.data.data;
                // 获取记录数
                that.total = res.data.data.length;
                // 分页
                that.getPageStudents();
                // 提示
                that.$message({
                  message: "删除数据成功！",
                  type: "success",
                });
              } else {
                // 找不到这个学生书局，显示error
                that.$message.error(res.data.msg);
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 批量删除学生信息
    deleteStudents(data) {
      this.$confirm(
        "确认批量删除" + this.selectStudents.length + "\t个学生信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          // 确认删除再来弹窗
          let that = this;
          // 调用后端接口;

          axios
            .post(that.baseURL + "students/delete/", {
              student: that.selectStudents,
            })
            .then((res) => {
              // 有这个学生数据
              if (res.data.code === 1) {
                // 获取所有的学生信息
                that.students = res.data.data;
                // 获取记录数
                that.total = res.data.data.length;
                // 分页
                that.getPageStudents();
                // 提示
                that.$message({
                  message: "批量删除数据成功！",
                  type: "success",
                });
              } else {
                // 找不到这个学生书局，显示error
                that.$message.error(res.data.msg);
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    handleSelectionChange(data) {
      this.selectStudents = data;
      console.log(data);
    },
    // 上传文件后确定，点击触发事件
  },
});
