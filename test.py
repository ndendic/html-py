from typing import List
html = str

my: html = """
<body>
    <h1>Hello, World!</h1>
    <button>Click Me!</button>
    <script>
        document.querySelector('button').addEventListener('click', () => {
            alert('Button was clicked!');
        });
    </script>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
    </style>
</body>
"""