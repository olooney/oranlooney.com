# Runnable code for the article, "A Seriously Slow Fibonacci Function."
# http://www.oranlooney.com/post/slow-fibonacci/

# Copyright (c) 2019 Oran Looney
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

from typing import Callable, Any

# church booleans
true =  lambda x: lambda y: x
false = lambda x: lambda y: y

# Boolean logic
AND = lambda x: lambda y: x(y)(false)
OR  = lambda x: lambda y: x(true)(y)
NOT = lambda x: x(false)(true)
XOR = lambda x: lambda y: x(NOT(y))(y)
#EQ  = lambda x: lambda y: x(y)(NOT(y))
MI = lambda x: lambda y: OR(NOT(x))(y) # material implication operator =>

# church numerals
plus = lambda m: lambda n: lambda f: lambda x: m(f)(n(f)(x))
succ = lambda n: lambda f: lambda x: f(n(f)(x))
mult = lambda m: lambda n: lambda f: lambda x: m(n(f))(x)
exp = lambda m: lambda n: n(m)
pred = lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)
minus = lambda m: lambda n: n(pred)(m)

# numeric predicates
is_zero = lambda n: n(lambda x: false)(true)
leq = lambda m: lambda n: is_zero(minus(m)(n))
less_than = lambda m: lambda n: leq(succ(m))(n)
eq = lambda m: lambda n: AND(leq(m)(n))(leq(n)(m))

# 0-10 for convenience
zero = lambda f: lambda x: x
one = lambda f: lambda x: f(x)
two = lambda f: lambda x: f(f(x))
two = succ(one)
three = succ(two)
four = succ(three)
five = succ(four)
six = succ(five)
seven = succ(six)
eight = succ(seven)
nine = succ(eight)
ten = succ(nine)

church_digits = [zero, one, two, three, four, five, six, seven, eight, nine]

def church_to_int(n: Callable) -> int:
    return n(lambda x: x+1)(0)

def int_to_church(n: int) -> Callable:
    church_number = church_digits[ int(str(n)[0]) ]
    for digit in str(n)[1:]:
        church_digit = church_digits[int(digit)]
        church_number = plus(mult(church_number)(ten))(church_digit)
    return church_number

def church_to_bool(b: Callable) -> bool:
    return b(True)(False)

def bool_to_church(b: bool) -> Callable:
    return true if b else false


################################################################################

# Test Cases
print('church numerals:')
for digit in church_digits:
    print(church_to_int(digit), 'succ:', church_to_int(succ(digit)), 'pred:', church_to_int(pred(digit)))

print('\nchurch math:')
print("2 + 2 =", church_to_int(plus(two)(two)))
print("6 + 7 =", church_to_int(plus(six)(seven)))
print("6 * 7 =", church_to_int(mult(six)(seven)))
print("7 - 5 =", church_to_int(minus(seven)(five)))
print("4*10 + 2 =", church_to_int(plus(mult(four)(ten))(two)))
print("1001 * 999 =", church_to_int(mult(int_to_church(1001))(int_to_church(999))))
print("3 ** 4 =",church_to_int(exp(three)(four)))

print('\nnumerals as loops:')
def greet(entity):
    print("Hello, {} World!".format(entity))
    return entity
three(greet)("Lambda Calculus");

print('\nchurch Boolean logic:')
print("true as int:", church_to_int(true(one)(zero)))
print("false as int:", church_to_int(false(one)(zero)))

print('\nchurch Boolean truth table for XOR:')
for a in [true, false]:
    for b in [true, false]:
        x = XOR(a)(b)
        print("{} XOR {} = {}".format(*map(church_to_bool, [a, b, x])), end='\t')
    print()

print('\nnumeral predicates:')
print('is_zero(0)', church_to_bool(is_zero(zero)))
print('is_zero(1)', church_to_bool(is_zero(one)))
print('is_zero(7)', church_to_bool(is_zero(seven)))
print('5 <= 2', church_to_bool(leq(five)(two)))
print('2 <= 5', church_to_bool(leq(two)(five)))
print('5 <= 5', church_to_bool(leq(five)(five)))
print('2 == 5', church_to_bool(eq(two)(five)))
print('5 == 5', church_to_bool(eq(five)(five)))
print('0 == 0', church_to_bool(eq(zero)(zero)))
print('0 == 1', church_to_bool(eq(zero)(one)))
print('1 == 0', church_to_bool(eq(one)(zero)))

################################################################################
# Recursion

# Y-combinator using the Omega-combinator
Y = lambda f: (lambda x: x(x))(lambda y: f(lambda z: y(y)(z)))

# Y-combinator, Curry's symetrical form
Y = lambda f: (lambda y: f(lambda z: y(y)(z)))(lambda y: f(lambda z: y(y)(z)))

# cheap hack to Prevent Infinite Recursion
def PIR(f):
    def wrapper_function(n):
        if church_to_bool(is_zero(n)):
            return zero
        else:
            return f(n)
    return wrapper_function

################################################################################
# Factorial

factorial = Y(lambda f: PIR(
    lambda n:
        ((leq)(n)(one)
            (one)
            (mult(n)(f(pred(n)))))))

def slow_factorial(n):
    n = int_to_church(n)
    fac = factorial(n)
    return church_to_int(fac)


print("\nfirst 5 factorials:")
for n in range(1, 6):
    f = slow_factorial(n)
    print('slow_factorial({}) = {}'.format(n, f))

################################################################################
# Fibonacci

fibonacci = Y(lambda f: PIR(
    # define function f(n) as:
    lambda n: (
        # if n < 2
        less_than(n)(two))
        # then n
            (n)
            # else f(n-1) + f(n-2)
            (plus
                (f(minus(n)(one)))
                (f(minus(n)(two))))))

def slow_fibonacci(n: int) -> int:
    n = int_to_church(n)
    fib = fibonacci(n)
    return church_to_int(fib)

print("\nfirst 10 fibonacci numbers:")
for n in range(11):
    f = slow_fibonacci(n)
    print('slow_fibonacci({}) = {}'.format(n, f))

fibonacci = Y(lambda f: PIR(lambda n: (less_than(m)(two))(n)(two)(n)(plus(f(minus(n)(one)))(f(minus(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: leq(succ(m))(n))(n)(two)(n)(plus(f(minus(n)(one)))(f(minus(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: is_zero(minus(m)(n)))(succ(m))(n))(n)(two)(n)(plus(f(minus(n)(one)))(f(minus(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: false)(true))(minus(m)(n)))(succ(m))(n))(n)(two)(n)(plus(f(minus(n)(one)))(f(minus(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: (lambda x: lambda y: y))(lambda x: lambda y: x))(minus(m)(n)))(succ(m))(n))(n)(two)(n)(plus(f(minus(n)(one)))(f(minus(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: (lambda x: lambda y: y))(lambda x: lambda y: x))((lambda m: lambda n: n(pred)(m))(m)(n)))(succ(m))(n))(n)(two)(n)(plus(f((lambda m: lambda n: n(pred)(m))(n)(one)))(f((lambda m: lambda n: n(pred)(m))(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: (lambda x: lambda y: y))(lambda x: lambda y: x))((lambda m: lambda n: n(pred)(m))(m)(n)))(succ(m))(n))(n)(two)(n)(plus(f((lambda m: lambda n: n(pred)(m))(n)(one)))(f((lambda m: lambda n: n(pred)(m))(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: (lambda x: lambda y: y))(lambda x: lambda y: x))((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(m)(n)))(succ(m))(n))(n)(two)(n)(plus(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)(one)))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: (lambda x: lambda y: y))(lambda x: lambda y: x))((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(m)(n)))(succ(m))(n))(n)(two)(n)((lambda m: lambda n: lambda f: lambda x: m(f)(n(f)(x)))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)(one)))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)(two))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: (lambda x: lambda y: y))(lambda x: lambda y: x))((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(m)(n)))(succ(m))(n))(n)(succ(one))(n)((lambda m: lambda n: lambda f: lambda x: m(f)(n(f)(x)))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)(lambda f: lambda x: f(x))))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)(succ(one)))))))
fibonacci = Y(lambda f: PIR(lambda n: (lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: (lambda x: lambda y: y))(lambda x: lambda y: x))((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(m)(n)))((lambda n: lambda f: lambda x: f(n(f)(x)))(m))(n))(n)((lambda n: lambda f: lambda x: f(n(f)(x)))(lambda f: lambda x: f(x)))(n)((lambda m: lambda n: lambda f: lambda x: m(f)(n(f)(x)))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)(lambda f: lambda x: f(x))))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)((lambda n: lambda f: lambda x: f(n(f)(x)))(lambda f: lambda x: f(x))))))))
fibonacci = (lambda f: (lambda x: x(x))(lambda y: f(lambda z: y(y)(z))))(lambda f: PIR(lambda n:(lambda m: lambda n: (lambda m: lambda n: (lambda n: n(lambda x: (lambda x: lambda y: y))(lambda x: lambda y: x))((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(m)(n)))((lambda n: lambda f: lambda x: f(n(f)(x)))(m))(n))(n)((lambda n: lambda f: lambda x: f(n(f)(x)))(lambda f: lambda x: f(x)))(n)((lambda m: lambda n: lambda f: lambda x: m(f)(n(f)(x)))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)(lambda f: lambda x: f(x))))(f((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)))(m))(n)((lambda n: lambda f: lambda x: f(n(f)(x)))(lambda f: lambda x: f(x))))))))

print("\nfirst 10 fibonacci numbers (after maco-expansion):")
for n in range(11):
    f = slow_fibonacci(n)
    print('slow_fibonacci({}) = {}'.format(n, f))

