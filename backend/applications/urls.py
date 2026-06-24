from django.urls import path
from .views import JobApplicationView

urlpatterns = [
    path('', JobApplicationView.as_view()),
]