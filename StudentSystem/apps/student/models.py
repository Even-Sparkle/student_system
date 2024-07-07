from django.db import models

# Create your models here.
#Student:学号，姓名，出生日期，性别，手机号码，邮箱，家庭住址，招聘
class Student(models.Model):
    sno = models.IntegerField(db_column='SNo', primary_key=True,null=False) #学号
    name = models.CharField(db_column='SName', max_length=100, null=False)
    birthday = models.DateField(db_column="Birthday",null=False)
    mobile = models.CharField(db_column="Mobile",max_length=100)
    email = models.EmailField(db_column="Email",max_length=100)
    gender_choice = (('男', '男'), ('女', '女'))
    gender = models.CharField(db_column="Gender",max_length=100,choices=gender_choice) #下拉框或单选按钮
    address = models.CharField(db_column="Address",max_length=200)
    image = models.ImageField(db_column="Image",max_length=200,null=True)

class Meta:
    managed = True
    db_table = 'Student'

def __str__(self):
    return "学号：%s\t 姓名：%s\t 性别：%s\t" % (self.sno, self.name, self.gender)