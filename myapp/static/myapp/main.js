var bookCount = 0; // 新增：一级标签计数器
document.getElementById('A-create').addEventListener('click', function() {
    // 删除了原来的输入提示，直接使用默认的标签名称
    var tag = document.createElement('span');
    bookCount++; // 新增：每次创建一级标签时，计数器加1
    tag.textContent = "Book" + bookCount; // 修改：默认的一级标签名称
    tag.style.display = "inline-block";
    tag.style.height = "32px";
    tag.style.textAlign = "center";
    tag.style.lineHeight = "32px";
    tag.addEventListener('dblclick', function() {
        var oldTagName = this.textContent;
        var newTagName = prompt("请输入新的一级标签名称");
        if (newTagName) {
            this.textContent = newTagName;
            // 向后端发送请求，更新TXT文件的名称
            fetch('/update_txt_name', {
                method: 'POST',
                body: JSON.stringify({oldTag: oldTagName, newTag: newTagName}),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function(response) {
                if (response.ok) {
                    console.log('TXT file name updated successfully');
                } else {
                    console.error('Failed to update TXT file name');
                }
            }).catch(function(error) {
                console.error('Error:', error);
            });
        }
    });
    tag.addEventListener('click', function() {
        // 清空B区的内容
        document.getElementById('B-tags').innerHTML = '';
        document.getElementById('B-chapters').innerHTML = '';
        document.getElementById('chapter-count').value = 0; // Reset the chapter count
        // 从一级标签的数据中获取对应的二级标签和三级标签，并添加到B区
        var firstLevelTags = document.getElementById('A-tags').children;
        for (var i = 0; i < firstLevelTags.length; i++) {
            firstLevelTags[i].style.backgroundColor = 'white';
        }
        // Change the background color of the selected tag
        this.style.backgroundColor = '#FAD278';
        var secondLevelTags = this.secondLevelTags || [];
        var thirdLevelTags = this.thirdLevelTags || [];
        secondLevelTags.forEach(function(tagName) {
            var tag = document.createElement('span');
            tag.textContent = tagName;
            tag.style.display = "inline-block";
            tag.style.height = "32px";
            tag.style.textAlign = "center";
            tag.style.lineHeight = "32px";
            document.getElementById('B-tags').appendChild(tag);
        });
        thirdLevelTags.forEach(function(tagName) {
            var tag = document.createElement('span');
            tag.textContent = tagName;
            tag.style.display = "inline-block";
            tag.style.height = "32px";
            tag.style.textAlign = "center";
            tag.style.lineHeight = "32px";
            document.getElementById('B-chapters').appendChild(tag);
        });
    });
    document.getElementById('A-tags').appendChild(tag);
    // 新增：向后端发送请求，创建对应的TXT文件
    fetch('/create_txt_for_primary_tag', {
        method: 'POST',
        body: JSON.stringify({
            tag_name: primaryTagName
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        if (response.ok) {
            console.log('TXT file created successfully');
        } else {
            console.error('Failed to create TXT file');
        }
    }).catch(function(error) {
        console.error('Error:', error);
    });
});

var tagCount = 0; // 新增：二级自定义标签计数器
document.getElementById('B-create').addEventListener('click', function() {
    // 删除了原来的输入提示，直接使用默认的标签名称
    var tag = document.createElement('span');
    tagCount++; // 新增：每次创建二级自定义标签时，计数器加1
    tag.textContent = "新标签" + tagCount; // 修改：默认的二级自定义标签名称
    tag.style.display = "inline-block";
    tag.style.height = "32px";
    tag.style.textAlign = "center";
    tag.style.lineHeight = "32px";
    tag.addEventListener('dblclick', function() {
        var newTagName = prompt("请输入新的二级自定义标签名称");
        if (newTagName) {
            this.textContent = newTagName;
        }
    });
    document.getElementById('B-tags').appendChild(tag);
    // 将新创建的二级标签添加到当前选中的一级标签的数据中
    var selectedFirstLevelTag = document.querySelector('#A-tags .selected');
    if (selectedFirstLevelTag) {
        selectedFirstLevelTag.secondLevelTags = selectedFirstLevelTag.secondLevelTags || [];
        selectedFirstLevelTag.secondLevelTags.push(tag.textContent);
    }
    // 新增：向后端发送请求，创建对应的TXT文件
    var selectedFirstLevelTag = document.querySelector('#A-tags .selected');
    if (selectedFirstLevelTag) {
        fetch('/save_tag', {
            method: 'POST',
            body: JSON.stringify({
                parent_tag_name: selectedFirstLevelTag.textContent,  // 新增
                tag_name: tag.textContent  // 修改
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            if (response.ok) {
                console.log('TXT file created successfully');
            } else {
                console.error('Failed to create TXT file');
            }
        }).catch(function(error) {
            console.error('Error:', error);
        });
    }
});



document.getElementById('B-create-2').addEventListener('click', function() {
    // 删除了原来的输入提示，直接使用默认的标签名称
    var tag = document.createElement('span');
    var chapterCount = document.getElementById('chapter-count').value;
    tag.textContent = "第" + (parseInt(chapterCount) + 1) + "章"; // 默认的三级标签名称
    tag.style.display = "inline-block";
    tag.style.height = "32px";
    tag.style.textAlign = "center";
    tag.style.lineHeight = "32px";
    tag.addEventListener('dblclick', function() {
        var newTagName = prompt("请输入新的三级标签名称");
        if (newTagName) {
            this.textContent = newTagName;
        }
    });
    document.getElementById('B-chapters').appendChild(tag);
    document.getElementById('chapter-count').value = parseInt(chapterCount) + 1; // 更新下划线上的数值
    // 将新创建的三级标签添加到当前选中的一级标签的数据中
    var selectedFirstLevelTag = document.querySelector('#A-tags .selected');
    if (selectedFirstLevelTag) {
        selectedFirstLevelTag.thirdLevelTags = selectedFirstLevelTag.thirdLevelTags || [];
        selectedFirstLevelTag.thirdLevelTags.push(tag.textContent);
    }
});

// 修改
document.getElementById('export-button').addEventListener('click', function() {
    // 弹出对话框让用户选择需要导出的一级标签
    var tagToExport = prompt("请输入需要导出的一级标签");
    if (tagToExport) {
        // 使用Fetch API发送一个HTTP请求到后端，请求中包含用户选择的一级标签
        // 修改：请求的URL和请求体的内容
        fetch('/export_txt', {
            method: 'POST',
            body: JSON.stringify({tag: tagToExport}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            if (response.ok) {
                // 处理后端返回的TXT文件，例如下载这个文件或显示在页面上
                console.log('Export successful');
            } else {
                console.error('Export failed');
            }
        }).catch(function(error) {
            console.error('Error:', error);
        });
    }
});

// 修改
document.getElementById('import-button').addEventListener('click', function() {
    // 弹出对话框让用户浏览本地目录和文件，选择需要导入的TXT文件
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.onchange = function(event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            // 使用Fetch API发送一个HTTP请求到后端，请求中包含TXT文件的内容
            // 修改：请求的URL和请求体的内容
            fetch('/import_txt', {
                method: 'POST',
                body: JSON.stringify({content: event.target.result}),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function(response) {
                if (response.ok) {
                    // 在A,B区显示后端返回的标签
                    console.log('Import successful');
                } else {
                    console.error('Import failed');
                }
            }).catch(function(error) {
                console.error('Error:', error);
            });
        };
        reader.readAsText(file);
    };
    fileInput.click();
});

// 修改
document.getElementById('save-button').addEventListener('click', function() {
    // 弹出对话框让用户选择需要保存的一级标签
    var tagToSave = prompt("请输入需要保存的一级标签");
    if (tagToSave) {
        // 使用Fetch API发送一个HTTP请求到后端，请求中包含用户选择的一级标签
        // 新增：向后端发送请求，保存对应的TXT文件
        fetch('/save_txt', {
            method: 'POST',
            body: JSON.stringify({tag: tagToSave}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            if (response.ok) {
                console.log('Save successful');
            } else {
                console.error('Save failed');
            }
        }).catch(function(error) {
            console.error('Error:', error);
        });
    }
});

// 修改```javascript
document.getElementById('delete-button').addEventListener('click', function() {
    // 弹出对话框让用户选择需要删除的一级标签
    var tagToDelete = prompt("请输入需要删除的一级标签");
    if (tagToDelete) {
        // 使用Fetch API发送一个HTTP请求到后端，请求中包含用户选择的一级标签
        // 新增：向后端发送请求，删除对应的TXT文件
        fetch('/delete_txt', {
            method: 'POST',
            body: JSON.stringify({tag: tagToDelete}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            if (response.ok) {
                // 删除A,B区的相应标签
                console.log('Delete successful');
            } else {
                console.error('Delete failed');
            }
        }).catch(function(error) {
            console.error('Error:', error);
        });
    }
});


document.getElementById('chapter-count').addEventListener('input', function() {
    var chapterCount = parseInt(this.value);
    var currentChapterCount = document.getElementById('B-chapters').children.length;
    if (chapterCount >= currentChapterCount) {
        for (var i = currentChapterCount; i < chapterCount; i++) {
            var tag = document.createElement('span');
            tag.textContent = "第" + (i + 1) + "章";
            tag.style.textAlign = "center";
            tag.style.lineHeight = "32px";
            tag.addEventListener('dblclick', function() {
                var newTagName = prompt("请输入新的三级标签名称");
                if (newTagName) {
                    this.textContent = newTagName;
                }
            });
            document.getElementById('B-chapters').appendChild(tag);
        }
    } else {
        alert("输入无效，输入的数值应大于等于已经存在的三级标签总数");
    }
});


document.getElementById('B-tags').addEventListener('click', function(e) {
    if (e.target.tagName === 'SPAN') {
        // 清除所有二级标签的背景色
        var tags = document.getElementById('B-tags').children;
        for (var i = 0; i < tags.length; i++) {
            tags[i].style.backgroundColor = 'white';
        }
        // 设置被点击的二级标签的背景色
        e.target.style.backgroundColor = '#FAD278';
    }

    // Clear C area
    document.getElementById('C').innerHTML = '';
    // Create a text area
    var textArea = document.createElement('textarea');
    textArea.style.width = '100%';
    textArea.style.height = '100%';
    document.getElementById('C').appendChild(textArea);
});

document.getElementById('B-chapters').addEventListener('click', function(e) {
    if (e.target.tagName === 'SPAN') {
        // 清除所有三级标签的背景色
        var tags = document.getElementById('B-chapters').children;
        for (var i = 0; i < tags.length; i++) {
            tags[i].style.backgroundColor = 'white';
        }
        // 设置被点击的三级标签的背景色
        e.target.style.backgroundColor = '#FAD278';
    }

    // Clear C area
    document.getElementById('C').innerHTML = '';
    // Create a div for tabs
    var tabContainer = document.createElement('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.width = '100%';
    tabContainer.style.height = '24px';
    document.getElementById('C').appendChild(tabContainer);
    // Create a div for text areas
    var textAreaContainer = document.createElement('div');
    textAreaContainer.style.width = '100%';
    textAreaContainer.style.height = 'calc(100% - 24px)';
    document.getElementById('C').appendChild(textAreaContainer);
    // Create tabs and text areas
    var tabs = ['characters', 'background', 'structure', 'Conflict', 'theme', 'text'];
    tabs.forEach(function(tabName, index) {
        var tab = document.createElement('div');
        tab.textContent = tabName;
        tab.style.border = '1px solid black';
        tab.style.textAlign = 'center';
        tab.style.flexGrow = '1';
        tab.addEventListener('dblclick', function() {
            var newTabName = prompt("请输入新的选项卡名称");
            if (newTabName) {
                this.textContent = newTabName;
            }
        });
        tab.addEventListener('click', function() {
        // Hide all text areas
        for (var i = 0; i < textAreaContainer.children.length; i++) {
            textAreaContainer.children[i].style.display = 'none';
            // Clear all tab colors
            tabContainer.children[i].style.backgroundColor = 'white';
        }
        // Show the text area corresponding to the clicked tab
        textAreaContainer.children[index].style.display = 'block';
        // Set the color of the selected tab
        this.style.backgroundColor = '#16878C';
        });
        tabContainer.appendChild(tab);
        // Create a text area for each tab
    var textArea = document.createElement('textarea');
    textArea.style.width = '100%';
    textArea.style.height = '100%';
    textArea.style.display = 'none'; // Hide the text area initially
    textArea.style.backgroundColor = '#FAD278'; // Set the background color of the text area
    textAreaContainer.appendChild(textArea);
    });
    // Show the first text area initially
    if (textAreaContainer.children.length > 0) {
        textAreaContainer.children[0].style.display = 'block';
        tabContainer.children[0].style.backgroundColor = '#16878C'; // Set the color of the first tab
    }
});



document.getElementById('chat-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        var userInput = this.value;
        // TODO: Send the user input to the chatbot and get the reply
        var chatbotReply = 'This is a reply from the chatbot.';
        displayUserMessage(userInput);
        displayChatbotReply(chatbotReply);
        this.value = ''; // Clear the input field
    }
});

function displayUserMessage(message) {
    var chatContent = document.getElementById('chat-content');
    var messageElement = document.createElement('div');
    messageElement.className = 'user-message';
    messageElement.textContent = 'user: ' + message;
    chatContent.appendChild(messageElement);
}

function displayChatbotReply(message) {
    var chatContent = document.getElementById('chat-content');
    var messageElement = document.createElement('div');
    messageElement.className = 'gpt-message';
    messageElement.textContent = 'gpt: ' + message;
    chatContent.appendChild(messageElement);
}

document.getElementById('chat-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// New code
document.getElementById('send-button').addEventListener('click', function() {
    var userInput = document.getElementById('chat-input').value;
    // Display user's message
    displayChatbotReply(userInput, 'user');
    // TODO: Send userInput to your server and get the chatbot's reply
    // For now, we'll just display a mock reply from the chatbot
    displayChatbotReply('This is a reply from the chatbot.', 'gpt');
    // Clear the input field
    document.getElementById('chat-input').value = '';
    // Reset the height of the input field
    document.getElementById('chat-input').style.height = 'auto';
});


function displayChatbotReply(message, sender) {
    var chatContent = document.getElementById('chat-content');
    var messageElement = document.createElement('pre');
    messageElement.className = sender + '-message';
    var senderElement = document.createElement('span');
    senderElement.className = 'sender';
    senderElement.textContent = sender;
    messageElement.appendChild(senderElement);
    messageElement.appendChild(document.createTextNode(message));
    chatContent.appendChild(messageElement);
    // Scroll to the bottom of the chat content
    chatContent.scrollTop = chatContent.scrollHeight;
}

