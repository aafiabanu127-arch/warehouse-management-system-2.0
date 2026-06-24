from django.db import models

class JobApplication(models.Model):
    job_title = models.CharField(max_length=200)
    department = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    current_location = models.CharField(max_length=200, blank=True)
    experience_years = models.CharField(max_length=50, blank=True)
    notice_period = models.CharField(max_length=50, blank=True)
    expected_salary = models.CharField(max_length=100, blank=True)
    cover_letter = models.TextField(blank=True)
    resume_link = models.CharField(max_length=500, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.full_name} - {self.job_title}"