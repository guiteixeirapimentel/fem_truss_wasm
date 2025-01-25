add_executable(main main.c)

target_link_libraries(main PRIVATE truss_fem)

add_library(truss_fem truss_fem.cpp new.cpp)

# add_library(MathLib INTERFACE)

# target_include_directories(MathLib INTERFACE ./)

if(${WASM})
    set(WASM_LINK_OPTIONS 
        "-fno-builtin"
        "--target=wasm32"
        "--no-standard-libraries"
        "-O2"
        "--target=wasm32"
        "-Wl,--no-entry"
        "-Wl,--allow-undefined"
        "-Wl,--export-all")
    set(WASM_COMPILE_OPTIONS
        -fno-builtin
        --target=wasm32
        --no-standard-libraries
        -O2
        -mbulk-memory)

    target_compile_options(main PUBLIC ${WASM_COMPILE_OPTIONS})
    target_link_options(main PUBLIC ${WASM_LINK_OPTIONS})

    target_compile_options(truss_fem PUBLIC ${WASM_COMPILE_OPTIONS})
    target_link_options(truss_fem PUBLIC ${WASM_LINK_OPTIONS})
    # set(CMAKE_C_FLAGS "-fno-builtin --target=wasm32 --no-standard-libraries -O2")
    # set(CMAKE_CXX_FLAGS "-fno-builtin --target=wasm32 --no-standard-libraries -O2 -std=c++20")

# target_compile_options(lib PUBLIC
#     "-fno-builtin" "--target=wasm32" "--no-standard-libraries" "-O2")
    # set(CMAKE_EXE_LINKER_FLAGS "-Wl,--no-entry -Wl,--allow-undefined -Wl,--export-all")

endif()