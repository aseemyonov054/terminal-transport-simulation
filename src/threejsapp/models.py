from django.db import models


class Project(models.Model):
    model_name = models.CharField(max_length=255)
    img_path = models.CharField(max_length=500)
    three_d_models = models.JSONField(default=list)
    path = models.JSONField(default=list)
