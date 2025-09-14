<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kategorie - WFO</title>
    <link rel="stylesheet" href="style.css?v=<?= filemtime('styles.css') ?>">
    <link rel="icon" type="image/png" href="https://www.wfo.com.pl/wp-content/uploads/2015/11/wfo-100x33.png">
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <!-- Navbar -->
    <?php include 'navbar.php'; ?>

    <!-- Main Content -->
    <main class="main-content">
        <div class="category-container">
            <div class="category-filter">
                <div class="category-header">
                    <h2>Wybierz kategorię</h2>
                </div>
                <div class="category-tags" id="category-tags">
                    <!-- Category buttons will be inserted here by JavaScript -->
                </div>
            </div>
            <div class="movie-grid">
                <!-- Movies will be inserted here by JavaScript -->
            </div>
        </div>
    </main>

    <!-- Footer -->
    <?php include 'footer.php'; ?>

    <script src="shared.js?v=<?= filemtime('shared.js') ?>"></script>
    <script src="app.js?v=<?= filemtime('app.js') ?>"></script>
</body>
</html>
