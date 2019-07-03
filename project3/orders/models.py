from django.db import models

# Create your models here.

class Pizza(models.Model):
    name = models.CharField(max_length=20)
    itemType = models.CharField(max_length=20)
    toppingAmount = models.IntegerField(max_length=5)
    smallPrice = models.DecimalField(max_digits=4,decimal_places=2)
    largePrice = models.DecimalField(max_digits=4,decimal_places=2)

    def __str__(self):
        return f"{self.pizzaType} {self.pizzaName} ({self.toppingAmount} topping(s))"

class Topping(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return f"The topping {self.name}"

class Sub(models.Model):
    name = models.CharField(max_length=20)
    smallPrice = models.DecimalField(max_digits=4,decimal_places=2)
    largePrice = models.DecimalField(max_digits=4,decimal_places=2)

class Addon(models.Model):
    name = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=4,decimal_places=2)

class Pasta(models.Model):
    name = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=4,decimal_places=2)

class Salad(models.Model):
    name = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=4,decimal_places=2)

class Platter(models.Model):
    name = models.CharField(max_length=20)
    smallPrice = models.DecimalField(max_digits=4,decimal_places=2)
    largePrice = models.DecimalField(max_digits=4,decimal_places=2)

class TotalOrder(models.Model):
    user = models.CharField(max_length=20)
    orderPrice = models.DecimalField(max_digits=4,decimal_places=2)

class ItemOrder(models.Model):
    itemName = models.CharField(max_length=20)
    itemPrice = models.DecimalField(max_digits=4,decimal_places=2)
    toppings = models.ManyToManyField(Topping, blank=True, related_name="orders")
    addons = models.ManyToManyField(Addon, blank=True, related_name="orders")
    itemStatus = models.CharField(max_length=20)
    itemPrice = models.DecimalField(max_digits=4,decimal_places=2)
    totalOrder = models.ForeignKey(TotalOrder, on_delete=models.CASCADE) #OneToMany Relationship where an many items can be linked to one total order

