// 全局变量定义
var bookCount = 0;
var tagCount = 0;
let csrftoken = document.querySelector('[name=csrf-token]').content;
let unsavedChanges = {};  // 新增的全局变量

// 工具函数定义

// 创建和样式化标签的函数
function createStyledTag(textContent) {
    var tag = document.createElement('span');
    tag.textContent = textContent;
    tag.style.display = "inline-block";
    tag.style.height = "32px";
    tag.style.textAlign = "center";
    tag.style.lineHeight = "32px";
    return tag;
}

// 发送异步请求的函数
function sendAsyncRequest(url, method, data) {
    return fetch(url, {
        method: method,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    }).then(function(response) {
        if (response.ok) {
            console.log('Request successful');
        } else {
            console.error('Request failed');
        }
    }).catch(function(error) {
        console.error('Error:', error);
    });
}

// 创建选项卡容器的函数
function createTabContainer() {
    var tabContainer = document.createElement('div');
    tabContainer.style.display = "flex";
    tabContainer.style.height = "24px";
    return tabContainer;
}

// 创建文本编辑区容器的函数
function createTextAreaContainer() {
    var textAreaContainer = document.createElement('div');
    textAreaContainer.style.width = "100%";
    textAreaContainer.style.height = "calc(100% - 24px)";
    return textAreaContainer;
}

// 创建选项卡的函数
function createTab(textContent, index, tabContainer, textAreaContainer, unsavedData) {
    var tab = document.createElement('div');
    tab.textContent = textContent;
    tab.style.flex = "1";
    tab.style.textAlign = "center";
    tab.style.lineHeight = "24px";
    tab.style.cursor = "pointer";
    tab.addEventListener('click', function() {
        // Hide all text areas
        for (var i = 0; i < textAreaContainer.children.length; i++) {
            textAreaContainer.children[i].style.display = 'none';
        }
        // Show the text area corresponding to the clicked tab
        textAreaContainer.children[index].style.display = 'block';
        // Change the background color of all tabs to white
        for (var i = 0; i < tabContainer.children.length; i++) {
            tabContainer.children[i].style.backgroundColor = 'white';
        }
        // Change the background color of the clicked tab
        this.style.backgroundColor = '#FAD278';
        // Update the content of the text area with unsaved changes
        textAreaContainer.children[index].value = unsavedData[textContent] || '';
    });
    return tab;
}

// 创建文本编辑区的函数
function createTextArea(unsavedData, tabName) {
    var textArea = document.createElement('textarea');
    textArea.style.width = '100%';
    textArea.style.height = '100%';
    textArea.style.display = 'none'; // Hide the text area initially
    textArea.value = unsavedData[tabName] || ''; // Set the initial value of the text area with unsaved changes
    textArea.addEventListener('input', function() {
        unsavedData[tabName] = this.value; // Update unsaved changes when the user edits the text
    });
    return textArea;
}

document.getElementById('A-create').addEventListener('click', function() {
    bookCount++;
    var primaryTagName = "Book" + bookCount;
    var tag = createStyledTag(primaryTagName);
    tag.addEventListener('dblclick', function() {
        var oldTagName = this.textContent;
        var newTagName = prompt("请输入新的一级标签名称");
        if (newTagName) {
            this.textContent = newTagName;
            sendAsyncRequest('/update_txt_name', 'POST', {oldTag: oldTagName, newTag: newTagName});
        }
    });

    tag.addEventListener('click', function() {
        document.getElementById('B-tags').innerHTML = '';
        document.getElementById('B-chapters').innerHTML = '';
        document.getElementById('chapter-count').value = 0; // Reset the chapter count
        var firstLevelTags = document.getElementById('A-tags').children;
        for (var i = 0; i < firstLevelTags.length; i++) {
            firstLevelTags[i].style.backgroundColor = 'white';
        }
        // Change the background color of the selected tag
        this.style.backgroundColor = '#FAD278';
        var secondLevelTags = this.secondLevelTags || [];
        var thirdLevelTags = this.thirdLevelTags || [];
        secondLevelTags.forEach(function(tagName) {
            var tag = createStyledTag(tagName);
            document.getElementById('B-tags').appendChild(tag);
        });
        thirdLevelTags.forEach(function(tagName) {
            var tag = createStyledTag(tagName);
            document.getElementById('B-chapters').appendChild(tag);
        });
    });

    document.getElementById('A-tags').appendChild(tag);

    //sendAsyncRequest('create_txt_for_primary_tag', 'POST', {tag_name: primaryTagName});
    unsavedChanges[primaryTagName] = {};  // 将新标签添加到unsavedChanges中
});

document.getElementById('B-create').addEventListener('click', function() {
    tagCount++;
    var tag = createStyledTag("新标签" + tagCount);

    tag.addEventListener('dblclick', function() {
        var newTagName = prompt("请输入新的二级自定义标签名称");
        if (newTagName) {
            this.textContent = newTagName;
        }
    });

    document.getElementById('B-tags').appendChild(tag);

    var selectedFirstLevelTag = document.querySelector('#A-tags .selected');
    if (selectedFirstLevelTag) {
        selectedFirstLevelTag.secondLevelTags = selectedFirstLevelTag.secondLevelTags || [];
        selectedFirstLevelTag.secondLevelTags.push(tag.textContent);

        //sendAsyncRequest('/save_tag', 'POST', {
        //    parent_tag_name: selectedFirstLevelTag.textContent,
        //    tag_name: tag.textContent
        //});
        unsavedChanges[selectedFirstLevelTag.textContent][tag.textContent] = {};  // 将新标签添加到unsavedChanges中对应的一级标签下
    }
});

document.getElementById('B-create-2').addEventListener('click', function() {
    var chapterCount = document.getElementById('chapter-count').value;
    var tag = createStyledTag("第" + (parseInt(chapterCount) + 1) + "章");

    tag.addEventListener('dblclick', function() {
        var newTagName = prompt("请输入新的三级标签名称");
        if (newTagName) {
            this.textContent = newTagName;
        }
    });

    document.getElementById('B-chapters').appendChild(tag);
    document.getElementById('chapter-count').value = parseInt(chapterCount) + 1;

    var selectedFirstLevelTag = document.querySelector('#A-tags .selected');
    if (selectedFirstLevelTag) {
        selectedFirstLevelTag.thirdLevelTags = selectedFirstLevelTag.thirdLevelTags || [];
        selectedFirstLevelTag.thirdLevelTags.push(tag.textContent);
    }
    var selectedSecondLevelTag = document.querySelector('#B-tags .selected');
    if (selectedSecondLevelTag) {
        unsavedChanges[selectedFirstLevelTag.textContent][selectedSecondLevelTag.textContent][tag.textContent] = '';  // 将新标签添加到unsavedChanges中对应的二级标签下
    }
});

document.getElementById('export-button').addEventListener('click', function() {
    var tagToExport = prompt("请输入需要导出的一级标签");
    if (tagToExport) {
        sendAsyncRequest('/export_txt', 'POST', {tag: tagToExport});
    }
});

document.getElementById('import-button').addEventListener('click', function() {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.onchange = function(event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            sendAsyncRequest('/import_txt', 'POST', {content: event.target.result});
        };
        reader.readAsText(file);
    };
    fileInput.click();
});

document.getElementById('save-button').addEventListener('click', function() {
    var tagToSave = prompt("请输入需要保存的一级标签");
    if (tagToSave) {
        sendAsyncRequest('/save_txt', 'POST', {tag: tagToSave});
    }
});

document.getElementById('delete-button').addEventListener('click', function() {
    var tagToDelete = prompt("请输入需要删除的一级标签");
    if (tagToDelete) {
        sendAsyncRequest('/delete_txt', 'POST', {tag: tagToDelete});
    }
});

document.getElementById('chapter-count').addEventListener('input', function() {
    var chapterCount = parseInt(this.value);
    var currentChapterCount = document.getElementById('B-chapters').children.length;
    if (chapterCount >= currentChapterCount) {
        for (var i = currentChapterCount; i < chapterCount; i++) {
            var tag = createStyledTag("第" + (i + 1) + "章");
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
        // Clear the selected state of all tags in 'B-tags' and 'B-chapters'
        var tags = document.getElementById('B-tags').children;
        var chapters = document.getElementById('B-chapters').children;
        for (var i = 0; i < tags.length; i++) {
            tags[i].style.backgroundColor = 'white';
        }
        for (var i = 0; i < chapters.length; i++) {
            chapters[i].style.backgroundColor = 'white';
        }
        // Set the selected state of the clicked tag
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
        // Clear the selected state of all tags in 'B-tags' and 'B-chapters'
        var tags = document.getElementById('B-tags').children;
        var chapters = document.getElementById('B-chapters').children;
        for (var i = 0; i < tags.length; i++) {
            tags[i].style.backgroundColor = 'white';
        }
        for (var i = 0; i < chapters.length; i++) {
            chapters[i].style.backgroundColor = 'white';
        }
        // Set the selected state of the clicked tag
        e.target.style.backgroundColor = '#FAD278';
    }

    // Clear C area
    document.getElementById('C').innerHTML = '';
    // Create a div for tabs
    var tabContainer = createTabContainer();
    document.getElementById('C').appendChild(tabContainer);
    // Create a div for text areas
    var textAreaContainer = createTextAreaContainer();
    document.getElementById('C').appendChild(textAreaContainer);
    // Create tabs and text areas
    var tabs = ['characters', 'background', 'structure', 'Conflict', 'theme', 'text'];
    tabs.forEach(function(tabName, index) {
        var tab = createTab(tabName, index, tabContainer, textAreaContainer);
        tabContainer.appendChild(tab);
        // Create a text area for each tab
        var textArea = createTextArea();
        textAreaContainer.appendChild(textArea);
    });
    // Show the first text area initially
    if (textAreaContainer.children.length > 0) {
        textAreaContainer.children[0].style.display = 'block';
        tabContainer.children[0].style.backgroundColor = '#16878C'; // Set the color of the first tab
    }
    // Trigger the click event of the first tab
    if (tabContainer.children.length > 0) {
    tabContainer.children[0].click();
    }
});

document.getElementById('chat-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        var userInput = this.value;
        displayMessage(userInput, 'user');
        this.value = ''; // Clear the input field
    }
});

document.getElementById('send-button').addEventListener('click', function() {
    var userInput = document.getElementById('chat-input').value;
    displayMessage(userInput, 'user');
    document.getElementById('chat-input').value = ''; // Clear the input field
    document.getElementById('chat-input').style.height = 'auto'; // Reset the height of the input field
});

function displayMessage(message, sender) {
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

window.onload = function() {
    fetch('/get_primary_tags/')
        .then(response => response.json())
        .then(primary_tags => {
            var A_tags = document.getElementById('A-tags');
            primary_tags.forEach(primary_tag => {
                var tag = createStyledTag(primary_tag);
                A_tags.appendChild(tag);
            });
        });
};
