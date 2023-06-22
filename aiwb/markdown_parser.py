import markdown
import re
import os

# 定义TXT文件的存储路径
DATABASE_PATH = '/aiwb/aiwb/database/'

# 新增的函数
def read_txt_file(file_path):
    if not os.path.exists(file_path):
        raise ValueError(f'The file {file_path} does not exist')
    with open(file_path, 'r') as file:
        content = file.read()
    return content

def write_txt_file(file_path, content):
    if os.path.exists(file_path):
        raise ValueError(f'The file {file_path} already exists')
    with open(file_path, 'w') as file:
        file.write(content)

def create_tag(tag_name, tag_type):
    if tag_type == 'first_level':
        default_name = 'Book'
    elif tag_type == 'second_level':
        default_name = '新标签'
    else:
        raise ValueError(f'Invalid tag type: {tag_type}')
    if not tag_name:
        tag_name = f'{default_name}{1}'
    return tag_name


# 修改的函数
def parse_markdown(content):
    lines = content.split('\n')
    data = {}
    current_tag = None
    current_chapter = None
    current_section = None
    for line in lines:
        if line.startswith('# Book: '):
            data['Book'] = line[8:]
        elif line.startswith('## Custom Tag: '):
            if current_tag is not None:
                raise ValueError('Nested custom tags are not allowed')
            current_tag = line[15:]
            data.setdefault('Custom Tags', {})[current_tag] = {}
        elif line.startswith('### Chapter: '):
            if current_tag is None:
                raise ValueError('Chapter outside of a custom tag')
            if current_chapter is not None:
                raise ValueError('Nested chapters are not allowed')
            current_chapter = line[13:]
            data['Custom Tags'][current_tag].setdefault('Chapters', {})[current_chapter] = {}
        elif line.startswith('#### '):
            if current_chapter is None:
                raise ValueError('Section outside of a chapter')
            if current_section is not None:
                raise ValueError('Nested sections are not allowed')
            current_section = line[5:]
            data['Custom Tags'][current_tag]['Chapters'][current_chapter][current_section] = ''
        else:
            if current_section is None:
                raise ValueError('Content outside of a section')
            data['Custom Tags'][current_tag]['Chapters'][current_chapter][current_section] += line

    # 在解析Markdown内容之后创建TXT文件
    with open(os.path.join(DATABASE_PATH, data['Book'] + '.txt'), 'w') as f:
        f.write(content)
    return data

def generate_markdown(data):
    if 'Book' not in data:
        raise ValueError('No book title')
    content = '# Book: ' + data['Book'] + '\n'
    for tag, tag_data in data.get('Custom Tags', {}).items():
        content += '## Custom Tag: ' + tag + '\n'
        for chapter, chapter_data in tag_data.get('Chapters', {}).items():
            content += '### Chapter: ' + chapter + '\n'
            for section, section_data in chapter_data.items():
                content += '#### ' + section + '\n' + section_data + '\n'
    return content
