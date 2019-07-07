from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("signup", views.signup_view, name="signup"),
    path("logout", views.logout_view, name="signout"),
    path("menu/<str:category>", views.menu_view, name="menu"),
    path("menu", views.defaultmenu_view, name="menu"),
    path("order/<str:category>", views.orderitem_view, name="order"),
    path("addtocart", views.addtocart_view, name="addtocart"),
    path("finishorder", views.finishorder_view, name="finishorder")
]