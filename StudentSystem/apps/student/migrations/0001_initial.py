# Generated by Django 5.0.6 on 2024-06-28 13:26

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('sno', models.IntegerField(db_column='SNo', primary_key=True, serialize=False)),
                ('name', models.CharField(db_column='SName', max_length=100)),
                ('birthday', models.DateField(db_column='Birthday')),
                ('mobile', models.CharField(db_column='Mobile', max_length=100)),
                ('email', models.EmailField(db_column='Email', max_length=100)),
                ('gender', models.CharField(choices=[('男', '男'), ('女', '女')], db_column='Gender', max_length=100)),
                ('address', models.CharField(db_column='Address', max_length=200)),
                ('image', models.ImageField(db_column='Image', max_length=200, null=True, upload_to='')),
            ],
        ),
    ]
# insert into 'student_student' values('sno', 'name', 'birthday', 'mobile', 'email', 'gender', 'address')