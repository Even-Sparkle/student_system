import openpyxl
from django.db.models import Q
from django.shortcuts import render
import os
import uuid
import hashlib

from django.http import JsonResponse
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from apps.student.models import Student
from django.http import JsonResponse
import json
# 引入json模块
# 导入Q查询
from django.db.models import Q
from django.http import HttpResponse
# 导入settings
from django.conf import settings


# Create your views here.
# 结果返回 code--value 1 成功 0失败
# data--value：具体数据 json格式
# msg--value 具体消息
def get_student(request):
    # 获取所有学生的信息
    # 使用ORM获取所有学生的信息
    try:
        obj_student = Student.objects.all().values()
        # 把结果转化为List类型
        students = list(obj_student)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "获取数据异常，具体错误：" + str(e)})


def query_student(request):
    # 查询学生信息
    # 接收传递过来的查询条件 axios默认json格式
    data = json.loads(request.body.decode('utf-8'))
    try:
        # 使用ORM获取满足条件的学生信息，并把对象转换为字典格式
        obj_student = Student.objects.filter(Q(sno__icontains=data['inputstr']) | Q(name__icontains=data['inputstr']) |
                                             Q(email__icontains=data['inputstr']) | Q(
            mobile__icontains=data['inputstr']) |
                                             Q(gender__icontains=data['inputstr']) | Q(
            address__icontains=data['inputstr'])).values()
        # 把结果转化为List类型
        students = list(obj_student)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "查询学生数据异常，具体错误：" + str(e)})


def check_exists_sno(request):
    # 判断学号是否存在
    data = json.loads(request.body.decode('utf-8'))
    try:
        obj_student = Student.objects.filter(sno=data['sno'])
        if obj_student.count() == 0:
            return JsonResponse({'code': 1, 'exists': False})
        else:
            return JsonResponse({'code': 1, 'exists': True})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "校验学号失败，具体原因" + str(e)})


# 添加学生
def add_student(request):
    # 添加学生到数据库
    data = json.loads(request.body.decode('utf-8'))
    # 接收前端传递过来的值
    try:
        obj_student = Student(sno=data['sno'], name=data['name'], birthday=data['birthday'],
                              mobile=data['mobile'], email=data['email'], gender=data['gender'],
                              address=data['address'])
        obj_student.save()
        obj_student = Student.objects.all().values()
        # 把结果转化为List类型
        students = list(obj_student)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "添加到数据库异常，具体原因" + str(e)})


def update_student(request):
    # 修改学生到数据库

    data = json.loads(request.body.decode('utf-8'))
    # 接收前端传递过来的值
    try:
        # 找到要修改的学生
        obj_student = Student.objects.get(sno=data['sno'])
        # 依次修改
        obj_student.name = data['name']
        obj_student.gender = data['gender']
        obj_student.birthday = data['birthday']
        obj_student.mobile = data['mobile']
        obj_student.email = data['email']
        obj_student.address = data['address']
        # 保存
        obj_student.save()
        obj_student = Student.objects.all().values()
        # 把结果转化为List类型
        students = list(obj_student)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "修改保存到数据库异常，具体原因" + str(e)})


def delete_student(request):
    # 修改学生到数据库

    data = json.loads(request.body.decode('utf-8'))
    # 接收前端传递过来的值
    try:
        # 找到要修改的学生
        obj_student = Student.objects.get(sno=data['sno'])
        # 删除
        obj_student.delete()
        obj_student = Student.objects.all().values()
        # 把结果转化为List类型
        students = list(obj_student)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "删除学生信息写入到数据库异常，具体原因" + str(e)})


def delete_students(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        for one_student in data['student']:
            # 查询当前记录
            obj_student = Student.objects.get(sno=one_student['sno'])
            obj_student.delete()
            obj_student = Student.objects.all().values()
            # 把结果转化为List类型
            students = list(obj_student)
            return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': "批量删除学生信息写入到数据库异常，具体原因" + str(e)})


def upload(request):
    # 接收上传的图片
    rev_file = request.FILES.get('avatar')
    # 判断是否有文件
    if not rev_file:
        return JsonResponse({'code': 0, 'msg': '图片不存在！'})
    # 获得一个唯一名字 uuid + hash
    new_name = get_random_str()
    file_extension = os.path.splitext(rev_file.name)[1]
    file_path = os.path.join(settings.MEDIA_ROOT, new_name + file_extension)
    # 开始写入
    try:
        with open(file_path, 'wb') as f:
            for chunk in rev_file.chunks():
                f.write(chunk)
        f.close()
        return JsonResponse({'code': 1, 'name': new_name + file_extension})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': str(e)})


def get_random_str():
    # 获取uuid的随机数
    uuid_val = uuid.uuid4()
    # 获取uuid的随机数字符串
    uuid_str = str(uuid_val).encode('utf-8')
    # 获取md5实例
    md5 = hashlib.md5()
    # 拿取uuid的md5摘要
    md5.update(uuid_str)
    # 返回固定长度的字符串
    return md5.hexdigest()


def import_students_excel(request):
    # 从excel批量导入学生信息
    # ==============1.读取Excel文件存储到Media文件夹===================
    rev_file = request.FILES.get('excel')
    # 判断是否有文件
    if not rev_file:
        return JsonResponse({'code': 0, 'msg': 'Excel文件不存在！'})
    # 获得一个唯一名字 uuid+hash
    new_name = get_random_str()
    file_path = os.path.join(settings.MEDIA_ROOT, new_name + os.path.splitext(rev_file.name)[1])
    # 开始写入
    try:
        f = open(file_path, 'wb')
        for i in rev_file.chunks():
            f.write(i)
        f.close()
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': str(e)})
    # ======================2.读取存储在Media文件夹的数据==============
    excel_students = read_excel_dict(file_path)

    # =====================3.把读取的数据存储到数据库===================
    # 定义变量 成功success 失败error
    success = 0
    error = 0
    error_snos = []
    for one_student in excel_students:
        try:
            obj_student = Student.objects.create(sno=one_student['sno'], name=one_student['name'],
                                                 birthday=one_student['birthday'],
                                                 mobile=one_student['mobile'],
                                                 email=one_student['email'], gender=one_student['gender'],
                                                 address=one_student['address'])
            # 保存
            obj_student.save()
            success += 1
        except:
            # 如果失败
            error += 1;
            error_snos.append(one_student['sno'])

    # ===================4.返回导入信息（成功x条，失败x条），返回所有学生信息===================
    obj_students = Student.objects.all().values()
    students = list(obj_students)
    return JsonResponse({'code': 1, 'success': success, 'error': error, 'errors': error_snos, 'data': students})


def read_excel_dict(path: str):
    # 实例化一个workbook
    workbook = openpyxl.load_workbook(path)
    # 实例化一个sheet
    # sheet = workbook.active
    sheet = workbook['student']
    # 定义一个变量存储最终的数据--[]
    students = []
    # 准备key
    keys = ['sno', 'name', 'birthday', 'mobile', 'email', 'gender', 'address']
    # 遍历
    for row in sheet.rows:
        temp_dict = {}
        for index, cell in enumerate(row):
            temp_dict[keys[index]] = cell.value
        students.append(temp_dict)
    # 返回
    return students
