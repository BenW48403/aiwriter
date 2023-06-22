from django.http import JsonResponse
from django.conf import settings
from .models import Tag, TextContent
from django.shortcuts import render
from aiwb.markdown_parser import parse_markdown
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import openai

openai.api_key = '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'

def index(request):
    return render(request, 'myapp/index.html')

def chat(request):
    message = request.GET.get('message', None)
    if message:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": message},
            ]
        )
        return JsonResponse(response['choices'][0]['message']['content'], safe=False)
    else:
        response = {"error": "No message provided"}
        return JsonResponse(response)

def get_tags(request):
    tags = Tag.objects.all()
    return JsonResponse([tag.to_dict() for tag in tags], safe=False)

def create_tag(request):
    new_tag = Tag.objects.create(name=request.POST['name'])
    return JsonResponse(new_tag.to_dict(), safe=False)

def edit_tag(request):
    tag = Tag.objects.get(id=request.POST['id'])
    tag.name = request.POST['name']
    tag.save()
    return JsonResponse(tag.to_dict(), safe=False)

def delete_tag(request):
    tag = Tag.objects.get(id=request.POST['id'])
    tag.delete()
    return JsonResponse({'status': 'success'}, safe=False)

def get_text_content(request):
    text_content = TextContent.objects.first()
    return JsonResponse(text_content.to_dict(), safe=False)

def update_text_content(request):
    text_content = TextContent.objects.first()
    text_content.content = request.POST['content']
    text_content.save()
    return JsonResponse(text_content.to_dict(), safe=False)

@csrf_exempt
def import_txt(request):
    if request.method == 'POST':
        file_content = json.loads(request.body)['content']
        # TODO: Save the file content to the appropriate place
        return JsonResponse({'status': 'success'}, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'}, safe=False)

@csrf_exempt
def export_txt(request):
    if request.method == 'POST':
        tag = json.loads(request.body)['tag']
        # TODO: Get the content associated with the tag
        content = 'This is a mock content.'
        response = HttpResponse(content, content_type='text/plain')
        response['Content-Disposition'] = 'attachment; filename={}.txt'.format(tag)
        return response
    else:
        return JsonResponse({'error': 'Invalid request method'}, safe=False)

@csrf_exempt
def save_tag(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        parent_tag_name = data['parent_tag_name']  # 新增
        tag_name = data['tag_name']  # 修改
        # 保存标签到TXT文件
        file_path = os.path.join(settings.BASE_DIR, 'tags', parent_tag_name + '.txt')  # 修改
        with open(file_path, 'a') as file:  # 修改
            file.write(tag_name + '\n')  # 修改
        return JsonResponse({'status': 'success'}, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'}, safe=False)
@csrf_exempt
def delete_tag(request):
    if request.method == 'POST':
        tag = json.loads(request.body)['tag']
        # TODO: Delete the tag
        return JsonResponse({'status': 'success'}, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'},False)

# 新增的函数
def import_txt(request):
    file_path = request.POST['file_path']
    if not os.path.exists(file_path):
        return JsonResponse({'error': 'File does not exist'}, safe=False)
    with open(file_path, 'r') as file:
        content = file.read()
    data = parse_markdown(content)
    # 保存数据到数据库或其他地方
    # ...

def export_txt(request):
    tag_id = request.POST['tag_id']
    # 从数据库或其他地方获取数据
    # ...
    content = "# Book: " + data['Book'] + "\n"
    for tag in data['Tags']:
        content += "## Custom Tag: " + tag['name'] + "\n"
        for chapter in tag['Chapters']:
            content += "### Chapter: " + chapter['name'] + "\n"
            for section in chapter['Sections']:
                content += "#### Section: " + section['name'] + "\n"
                content += section['content'] + "\n"
    file_path = os.path.join(settings.BASE_DIR, 'export', tag_id + '.txt')
    if not os.path.exists(file_path):
        return JsonResponse({'error': 'File does not exist'}, safe=False)
    with open(file_path, 'w') as file:
        file.write(content)
    return JsonResponse({'file_path': file_path}, safe=False)

def save_tag(request):
    tag_id = request.POST['tag_id']
    tag_content = request.POST['tag_content']
    # 保存标签到TXT文件
    file_path = os.path.join(settings.BASE_DIR, 'tags', tag_id + '.txt')
    with open(file_path, 'w') as file:
        file.write(tag_content)
    return JsonResponse({'status': 'success'}, safe=False)

def delete_tag(request):
    tag_id = request.POST['tag_id']
    # 删除TXT文件
    file_path = os.path.join(settings.BASE_DIR, 'tags', tag_id + '.txt')
    if os.path.exists(file_path):
        os.remove(file_path)
    return JsonResponse({'status': 'success'}, safe=False)

# 新增的代码
def create_txt_for_primary_tag(request):
    if request.method == 'POST':
        tag_name = request.POST['tag_name']
        # 在这里创建TXT文件
        # ...
        return JsonResponse({'status': 'success'})