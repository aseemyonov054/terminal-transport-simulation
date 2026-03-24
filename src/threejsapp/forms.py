from django import forms

class BackgroundInputForm(forms.Form):
    image = forms.ImageField(label="Background image")