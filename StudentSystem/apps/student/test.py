import openpyxl


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
            # 组合
            temp_dict[keys[index]] = cell.value
        students.append(temp_dict)
    # 返回
    return students


if __name__ == '__main__':
    path = "D:/student01.xlsx"
    students = read_excel_dict(path)
    print(students)
