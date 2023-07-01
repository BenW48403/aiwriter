from django.http import JsonResponse
from django.conf import settings
from .models import Tag, TextContent
from django.shortcuts import render
from aiwb.markdown_parser import parse_markdown, generate_markdown
#from django.http import HttpResponse
#from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
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
    new_tag = Tag()
    new_tag.create(request.POST['name'])
    return JsonResponse(new_tag.unsaved_changes.get_changes(), safe=False)

def edit_tag(request):
    tag = Tag.objects.get(id=request.POST['id'])
    tag.rename(request.POST['name'])
    return JsonResponse(tag.unsaved_changes.get_changes(), safe=False)

def get_text_content(request):
    text_content = TextContent.objects.first()
    return JsonResponse(text_content.to_dict(), safe=False)

def update_text_content(request):
    text_content = TextContent.objects.first()
    text_content.content = request.POST['content']
    text_content.save()
    return JsonResponse(text_content.to_dict(), safe=False)

#@csrf_exempt
def create_txt_for_primary_tag(request):
    print("Received a request in create_txt_for_primary_tag")
    if request.method == 'POST':
        data = json.loads(request.body)
        print(f"Request body: {data}")  # Add this line
        tag_name = data.get('tag_name')
        print(f"Tag name: {tag_name}")  # Add this line
        file_name = f"{tag_name}.txt"
        file_path = os.path.join('database', file_name)  # Change this line
        print(f"File path: {file_path}")  # Add this line
        print(f"Default storage location: {default_storage.location}")  # Add this line
        if not default_storage.exists(file_path):
            default_storage.save(file_path, ContentFile(""))
        return JsonResponse({'status': 'success'}, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'}, safe=False)


# 新增的函数
def import_txt(request):
    file_path = request.POST['file_path']
    if not os.path.exists(file_path):
        return JsonResponse({'error': 'File does not exist'}, safe=False)
    content = read_txt_file(file_path)  # 使用read_txt_file函数读取TXT文件的内容
    data = parse_markdown(content)  # 使用parse_markdown函数解析TXT文件的内容
    for book, book_data in data.items():
        for tag_name, tag_data in book_data.items():
            tag, created = Tag.objects.get_or_create(name=tag_name)
            for chapter_name, chapter_data in tag_data.items():
                for section_name, section_data in chapter_data.items():
                    for tab_name, tab_data in section_data.items():
                        TextContent.objects.update_or_create(
                            tag=tag,
                            chapter=chapter_name,
                            section=section_name,
                            tab=tab_name,
                            defaults={'content': tab_data}
                        )
    return JsonResponse({'status': 'success'}, safe=False)


def export_txt(request):
    tag_id = request.POST['tag_id']
    tag = Tag.objects.get(id=tag_id)
    data = {
        'Book': tag.name,
        'Tags': []
    }
    text_contents = TextContent.objects.filter(tag=tag)
    for text_content in text_contents:
        data['Tags'].append({
            'name': text_content.chapter,
            'Chapters': [
                {
                    'name': text_content.section,
                    'Sections': [
                        {
                            'name': text_content.tab,
                            'content': text_content.content
                        }
                    ]
                }
            ]
        })
    content = generate_markdown(data)  # 使用generate_markdown函数生成Markdown内容
    file_path = os.path.join(settings.BASE_DIR, 'export', tag_id + '.txt')
    write_txt_file(file_path, content)  # 使用write_txt_file函数将Markdown内容写入到TXT文件中
    return JsonResponse({'file_path': file_path}, safe=False)

def save_tag(request):
    tag_id = request.POST['tag_id']
    tag_content = request.POST['tag_content']
    tag = Tag.objects.get(id=tag_id)
    text_content = TextContent.objects.get(tag=tag)
    text_content.content = tag_content
    text_content.save()
    return JsonResponse({'status': 'success'}, safe=False)

def delete_tag(request):
    tag_id = request.POST['tag_id']
    tag = Tag.objects.get(id=tag_id)
    tag.delete()
    return JsonResponse(tag.unsaved_changes.get_changes(), safe=False)

def get_primary_tags(request):
    # Replace this with your actual data
    data = {'tags': ['tag1', 'tag2', 'tag3']}
    return JsonResponse(data)