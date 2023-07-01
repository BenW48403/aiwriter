from django.db import models

class UnsavedChanges:
    def __init__(self):
        self.changes = []

    def add_change(self, change_type, details):
        self.changes.append({
            "type": change_type,
            "details": details,
        })

    def get_changes(self):
        return self.changes

    def clear_changes(self):
        self.changes = []

class Tag(models.Model):
    name = models.CharField(max_length=200)
    unsaved_changes = UnsavedChanges()

    def create(self, name):
        self.unsaved_changes.add_change('create', {'name': name})

    def delete(self):
        self.unsaved_changes.add_change('delete', {'id': self.id})

    def rename(self, new_name):
        self.unsaved_changes.add_change('rename', {'id': self.id, 'new_name': new_name})

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }

class TextContent(models.Model):
    content = models.TextField()

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
        }

class Chapter(models.Model):
    name = models.CharField(max_length=200)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    unsaved_changes = UnsavedChanges()

    def create(self, name):
        self.unsaved_changes.add_change('create', {'name': name})

    def delete(self):
        self.unsaved_changes.add_change('delete', {'id': self.id})

    def rename(self, new_name):
        self.unsaved_changes.add_change('rename', {'id': self.id, 'new_name': new_name})

class Section(models.Model):
    name = models.CharField(max_length=200)
    content = models.TextField()
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    unsaved_changes = UnsavedChanges()

    def create(self, name, content):
        self.unsaved_changes.add_change('create', {'name': name, 'content': content})

    def delete(self):
        self.unsaved_changes.add_change('delete', {'id': self.id})

    def edit(self, new_content):
        self.unsaved_changes.add_change('edit', {'id': self.id, 'new_content': new_content})
