from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('animate/', views.animate, name='animate'),
    path('draw/', views.draw, name="draw"),
    path('parallel/', views.parallel, name="parallel"),
    path('parallel/new/', views.new_model, name="new_model"),
    path('parallel/new_path/', views.new_path, name="new_path"),
    path('parallel/create_path/', views.create_path, name="create_path"),
    path('parallel/save_path/', views.save_path, name="save_path"),
    path('parallel/run_sim/', views.run_sim, name="run_sim"),
]