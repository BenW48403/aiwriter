from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length=200)

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
