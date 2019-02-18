// memoized version
ImplicitMatrix repeatedSquares(int n)
{
    // 0 squares means the original basis matrix f1
    static std::vector<ImplicitMatrix> cache = { {1, 0} };

    // repeatedly square as often as necessary.
    while (n >= cache.size() ) {
        cache.push_back( square(cache.back()) );
    }

    // the n-th element is always f1^n.
    return cache[n];
}

ImplicitMatrix power(
    const ImplicitMatrix& x,
    const bigint& m)
{
    if ( m == 0 ) {
        return {0, 1};
    } else if ( m == 1 ) {
        return x;
    }

    // powers of two by iterated squaring
    // ImplicitMatrix powerOfTwo = x;
    bigint n = 2;
    int n_squares_needed = 0;
    while ( n <= m ) {
        n = n*2;
        n_squares_needed++;
    //powerOfTwo = square(powerOfTwo);
    }
    ImplicitMatrix powerOfTwo = repeatedSquares(n_squares_needed);

    // recurse for remainder
    ImplicitMatrix remainder = power(x, m-n/2);

    return multiply(powerOfTwo, remainder);
}
