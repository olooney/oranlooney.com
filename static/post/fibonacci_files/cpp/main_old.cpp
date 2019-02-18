#include <iostream>
#include <boost/multiprecision/gmp.hpp>

typedef boost::multiprecision::mpz_int bigint;

namespace fib {

class ImplicitMatrix {
public:
    bigint a;
    bigint b;

    ImplicitMatrix(const ImplicitMatrix& other)
        : a(other.a)
        , b(other.b)
    {
    }

    ImplicitMatrix(
        const bigint& _a,
        const bigint& _b)
        : a(_a)
        , b(_b)
    {
    }
};

ImplicitMatrix multiply(
    const ImplicitMatrix& x,
    const ImplicitMatrix& y)
{
    return {
        y.a * (x.a + x.b) + x.a * y.b,
        x.a * y.a + x.b * y.b
    };
}

ImplicitMatrix square(const ImplicitMatrix& x)
{
    // we save one bigint multipication by
    // specializing for the case of squaring.
    bigint a2 = x.a * x.a;
    bigint _2ab = (x.a * x.b) << 1;
    bigint b2 = x.b * x.b;
    return {
        a2 + _2ab,
        a2 + b2
    };
}

ImplicitMatrix power(
    const ImplicitMatrix& x,
    const bigint& m)
{
    if (m == 0) {
        return { 0, 1 };
    }
    else if (m == 1) {
        return x;
    }

    // powers of two by iterated squaring
    ImplicitMatrix powerOfTwo = x;
    bigint n = 2;
    while (n <= m) {
        powerOfTwo = square(powerOfTwo);
        n = n * 2;
    }
    // recurse for remainder
    ImplicitMatrix remainder = power(x, m - n / 2);

    return multiply(powerOfTwo, remainder);
}

} // end namespace fib

bigint fibonacci(const bigint& n)
{
    fib::ImplicitMatrix f1{ 1, 0 };
    return fib::power(f1, n).a;
}

int main(int argc, const char* argv[])
{
    // require the first command line argument
    if (argc < 2) {
        std::cerr << "USAGE: fib N" << std::endl;
        return 1;
    }
    // parse the first argument into a bigint
    bigint n(argv[1]);

    // force the calculation of the n-th fibonacci
    // number but do not print it.
    volatile bigint f = fibonacci(n);
    return 0;
}
