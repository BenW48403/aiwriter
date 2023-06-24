from django.urls import path

from . import views

urlpatterns = [
    path('chat/', views.chat),
    path('get_tags/', views.get_tags),
    path('create_tag/', views.create_tag),
    path('edit_tag/', views.edit_tag),
    path('delete_tag/', views.delete_tag),
    path('get_text_content/', views.get_text_content),
    path('update_text_content/', views.update_text_content),
    path('import_txt/', views.import_txt),  # 添加这一行
    path('export_txt/', views.export_txt),  # 添加这一行
    path('save_tag/', views.save_tag),  # 添加这一行
    path('delete_tag/', views.delete_tag),  # 添加这一行
    path('', views.index, name='index'),
    path('create_txt_for_primary_tag', views.create_txt_for_primary_tag, name='create_txt_for_primary_tag'),
]

