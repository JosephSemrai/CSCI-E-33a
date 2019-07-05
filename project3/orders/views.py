from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib import messages
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.db import IntegrityError
from .models import *

# Create your views here.
def index(request):
    return render(request, "index.html")

def login_view(request):
    if request.method == 'POST':
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("menu"))
        else:
            messages.error(request, 'Invalid Credentials')
            return render(request, "login.html")
    return render(request, "login.html")

def signup_view(request):
    if request.method == 'POST':
        email = request.POST["email"]
        username = request.POST["username"]
        password = request.POST["password"]
        try:
            user = get_user_model().objects.create_user(username=username, email=email, password=password)
            messages.success(request, 'Signed up successfully. Please sign in.')
            return HttpResponseRedirect(reverse('login'))
        except IntegrityError:
            messages.error(request, "Username or email already exists.")
            render(request,"signup.html")

    return render(request, "signup.html")

def logout_view(request):
    logout(request)
    messages.success(request, 'Signed out!')

    return HttpResponseRedirect(reverse('index'))

@login_required
def menu_view(request, category):
    # if category == "pizza" or category == "subs" or category == "platters":
    #     colnum = 3
    # elif category == "pasta" or category == "salads":
    #     colnum = 2
    category = category.capitalize()
    cart = getCart(request)
    print(f"Created cart: {cart.orderStatus}")
    
    context = {
        'menuitems':globals()[category].objects.all(),
        'itemcategory': _(category),
        'cart': cart
    }

    return render(request, "menu.html", context)

@login_required
def defaultmenu_view(request):
    return render(request, "defaultmenu.html", {'user': request.user})

@login_required
def orderitem_view(request, category):
    itemid = int(request.GET.get('item_id'))
    # category = category.capitalize().rsplit('/', 1)[-1]

    #ADD LOGIC AND SUCH FOR SPECIFIC ITEMS HERE BY FETCHING THE ITEM FIRST, ONLY ADD TO ORDER WHEN DONE
    item = globals()[category].objects.get(id=itemid)
    context = {
        'toppings':globals()["Topping"].objects.all(),
        'itemcategory': category, 
        'item':item 
    }

    print(category)

    return render(request, "orderscreen.html", context)

def addtocart_view(request, category):
    return render(request, "orderscreen.html")
def getCart(request):
    print("DEBUG")
    for item in request.user.totalorder_set.all():
        print(item.orderStatus)
        print(f"Username: {item.user.username}")
    try:
        lastOrder = request.user.totalorder_set.latest('id') #Gets the last cart for the specific user
    except:
        print("EXCEPTION EXCEPTION EXCEPTION")
        lastOrder = TotalOrder.create(request.user, 0.00, "In Progress")

    if lastOrder == None or lastOrder.orderStatus != "In Progress":
        lastOrder = TotalOrder.create(request.user, 0.00, "In Progress")
        getCart(request)
    
    lastOrder.save()

    return lastOrder
