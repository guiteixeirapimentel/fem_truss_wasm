#include <gtest/gtest.h>
#include <Matrix.hpp>
#include <MatrixUtils.hpp>

TEST(BasicLinearSystemSolve, Solve2x2)
{
    const Matrix<double> K{2, 2, {1, 2, 3, 5}};

    const Matrix<double> f(2, 1, {1, 2});

    const auto InvK = CalcInvMatriz(K);

    const auto u = InvK * f;

    constexpr double kEps = 1e-6;

    ASSERT_NEAR(u(0, 0), -1.0, kEps);
    ASSERT_NEAR(u(1, 0), 1.0, kEps);
}